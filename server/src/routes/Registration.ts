import { PrismaClient, Registration } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { generateSalt, hashPassword } from "../utils/security";
import { sendApprovedEmail, sendRegistrationEmail, sendRejectedEmail } from "../utils/email";
import { REGISTRATION_STATUS } from "../utils/constants";

export const registrationRouter = express.Router();

const prisma = new PrismaClient();

registrationRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  const findObject = generateFindObject(page, size, sort, filter);

  const registrations = await prisma.$transaction([
    prisma.registration.count(...findObject.where),
    prisma.registration.findMany(findObject),
  ]);

  // create result object
  const result = generateResultJson(
    registrations[1],
    registrations[0],
    page,
    size
  );

  res.status(200).json(result);
});

registrationRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const registration = await prisma.registration
    .findFirstOrThrow({
      where: {
        id: Number(id),
      },
    })
    .catch((error) => {
      res.status(404).json({
        message: `Registration details with ID ${id} does not exist in the database`,
      });
    });

  res.status(200).json(generateResultJson(registration));
});

registrationRouter.post("/", async (req, res) => {
  const registration_details = req.body;
  console.log(registration_details);
  try {
    registration_details.created_by = "SYSTEM";
    registration_details.updated_by = "SYSTEM";
    registration_details.approve_status = REGISTRATION_STATUS.PENDING;
    registration_details.contact_no = Number(registration_details.contact_no);
    registration_details.no_of_employees = Number(
      registration_details.no_of_employees
    );

    const { id, ...registration } = registration_details;

    const new_registration = await prisma.registration.create({
      data: registration,
    });

    // send registration email to registrant
    await sendRegistrationEmail(registration_details.email, registration_details.registrant_name, registration_details.company_name);

    res.status(200).json(generateResultJson(new_registration));
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

registrationRouter.post("/update", async (req, res) => {
  const registration_details = req.body;

  try {
    const pending_registration = await prisma.registration.findFirst({
      where: {
        id: registration_details.id,
        approve_status: REGISTRATION_STATUS.PENDING,
      },
    });

    // update registration status
    const user = req.headers["x-access-user"] as any;
    registration_details.updated_by = user["fullname"];
    registration_details.updated_date = new Date();

    const updated_registration = await prisma.registration.update({
      where: {
        id: registration_details.id,
      },
      data: registration_details,
    });

    // check if is approving registration
    if (pending_registration && registration_details.approve_status === REGISTRATION_STATUS.APPROVED) {
      console.info(
        "Approving registration... creating company details and system admin account..."
      );
      await approveRegistration(registration_details).then((res) => {
        sendApprovedEmail(
          res.username,
          res.user,
          res.company,
          { username: res.username, password: res.password }
        );
      }).catch((error) => {
        // revert registration status to pending
        updated_registration.approve_status = REGISTRATION_STATUS.PENDING;
        prisma.registration.update({
          where: {
            id: registration_details.id,
          },
          data: updated_registration,
        });

        res.status(400).send(error);
        return;
      });
    } 
    // check if is rejecting registration
    else if (pending_registration && registration_details.approve_status === REGISTRATION_STATUS.REJECTED) {
      await sendRejectedEmail(registration_details.email, registration_details.registrant_name, registration_details.company_name);
    }

    res.status(200).json(generateResultJson(updated_registration));
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

const approveRegistration = async (registration_details: Registration) => {
  try {
    // check if company uen already exists
    const existing_company = await prisma.company.findFirst({
      where: {
        uen: registration_details.uen_id,
      },
    });

    // throw error if company already exists
    if(existing_company) {
      throw new Error("Company already exists");
    }
    
    // create new company
    const new_company = {
      uen: registration_details.uen_id,
      name: registration_details.company_name,
      address: registration_details.address,
      industry: registration_details.industry,
      no_of_employees: registration_details.no_of_employees,
      contact_no: registration_details.contact_no, //TODO: contact number to use registrant contact number?
      email: registration_details.email, // TODO: email to use registrant email?
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    };

    const company = await prisma.company.create({
      data: new_company,
    });

    // create new system admin account
    const new_system_admin = {
      id: 1,
      company_id: company.id,
      fullname: registration_details.registrant_name,
      contact_no: registration_details.contact_no,
      email: registration_details.email,
      password: hashPassword(registration_details.uen_id, generateSalt()),
      role: "A",
      position: "SYSTEM ADMIN",
      status: "A",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
      department_id: null,
    };

    const system_admin = await prisma.user.create({
      data: new_system_admin,
    });

    return {
      username: system_admin.email,
      password: registration_details.uen_id,
      company: company.name,
      user: system_admin.fullname,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
