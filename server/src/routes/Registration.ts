import { PrismaClient, Registration } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { generateSalt, hashPassword } from "../utils/security";
import {
  sendApprovedEmail,
  sendRegistrationEmail,
  sendRejectedEmail,
} from "../utils/email";
import { PAYMENT_CYCLE, REGISTRATION_STATUS, SEQUENCE_KEYS, SUBSCRIPTION_STATUS } from "../utils/constants";
import { getNextSequenceValue, instantiateSequences } from "../utils/sequence";
import { get } from "http";

export const registrationRouter = express.Router();

const prisma = new PrismaClient();

registrationRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);

    const registrations = await prisma.$transaction([
      prisma.registration.count({where: findObject.where}),
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
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting registrations.");
  }
});

registrationRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
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
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting registration.");
  }
});

registrationRouter.post("/", async (req, res) => {
  const registration_details = req.body;

  try {
    registration_details.created_by = "SYSTEM";
    registration_details.updated_by = "SYSTEM";
    registration_details.approve_status = REGISTRATION_STATUS.PENDING;
    registration_details.contact_no = Number(registration_details.contact_no);
    registration_details.no_of_employees = Number(
      registration_details.no_of_employees
    );
    registration_details.subscription_model_id = Number(registration_details.subscription_model);
    registration_details.company_name = registration_details.company_name.toUpperCase();
    registration_details.email = registration_details.email.toUpperCase();
    registration_details.registrant_name = registration_details.registrant_name.toUpperCase();
    registration_details.address = registration_details.address.toUpperCase();

    const { id, subscription_model, ...registration } = registration_details;

    const new_registration = await prisma.registration.create({
      data: registration,
    });

    // send registration email to registrant
    await sendRegistrationEmail(
      registration_details.email,
      registration_details.registrant_name,
      registration_details.company_name
    );

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
    if (
      pending_registration &&
      registration_details.approve_status === REGISTRATION_STATUS.APPROVED
    ) {
      console.info(
        "Approving registration... creating company details and system admin account..."
      );
      await approveRegistration(registration_details)
        .then((res) => {
          sendApprovedEmail(res.username, res.user, res.company, {
            username: res.username,
            password: res.password,
          });
        })
        .catch((error) => {
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
    else if (
      pending_registration &&
      registration_details.approve_status === REGISTRATION_STATUS.REJECTED
    ) {
      await sendRejectedEmail(
        registration_details.email,
        registration_details.registrant_name,
        registration_details.company_name
      );
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
    if (existing_company) {
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

    // create new subscription for company
    const subscription_model_id = registration_details.subscription_model_id;
    const subscription_model = await prisma.subscriptionModel.findFirst({
      where: {
        id: subscription_model_id || 0,
      },
    });

    if (!subscription_model) {
      throw new Error("Subscription model does not exist");
    }

    const start_date = new Date();
    let end_date = start_date;
    if(subscription_model.payment_cycle === PAYMENT_CYCLE.ANNUALLY) {
      end_date.setFullYear(end_date.getFullYear() + 1);
    } else {
      if(end_date.getMonth() === 11) {
        end_date.setFullYear(end_date.getFullYear() + 1);
        end_date.setMonth(0);
      } else {
        end_date.setMonth(end_date.getMonth() + 1);
      }
    }

    const new_subscription = {
      company_id: company.id,
      type: subscription_model.name,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      employee_quantity: subscription_model.member_limit,
      start_date: start_date,
      end_date: end_date, 
      payment_cycle: subscription_model.payment_cycle,
      price: subscription_model.price,
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    };

    const subscription = await prisma.subscription.create({
      data: new_subscription,
    });

    // instantiate sequence table for company
    await instantiateSequences(company.id);

    // create new code types for company
    const code_types = [
      {
        id: await getNextSequenceValue(company.id, SEQUENCE_KEYS.COMPANY_CODE_TYPE_SEQUENCE),
        company_id: company.id,
        code_type: "POSITION",        
        status: "A",
        created_by: "SYSTEM",
        updated_by: "SYSTEM",
      },
      {
        id: await getNextSequenceValue(company.id, SEQUENCE_KEYS.COMPANY_CODE_TYPE_SEQUENCE),
        company_id: company.id,
        code_type: "EMPLOYMENT_TYPE",        
        status: "A",
        created_by: "SYSTEM",
        updated_by: "SYSTEM",
      },
      {
        id: await getNextSequenceValue(company.id, SEQUENCE_KEYS.COMPANY_CODE_TYPE_SEQUENCE),
        company_id: company.id,
        code_type: "LEAVE_TYPE",        
        status: "A",
        created_by: "SYSTEM",
        updated_by: "SYSTEM",
      },
    ];

    await prisma.companyCodeType.createMany({
      data: code_types,
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
      employment_details: {
        create: {
          working_hours: null,
          employment_type: null,
          created_by: "SYSTEM",
          updated_by: "SYSTEM",
        },
      }
    };

    const system_admin = await prisma.user.create({
      data: new_system_admin,
    });

    //

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
