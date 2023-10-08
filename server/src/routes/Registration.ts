import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const registrationRouter = express.Router();

const prisma = new PrismaClient();

registrationRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  const findObject = generateFindObject(page, size, sort, filter);

  const registrations = await prisma.$transaction([
    prisma.registration.count(),
    prisma.registration.findMany(findObject),
  ]);

  // create result object
  const result = generateResultJson(registrations[1], registrations[0], page, size);

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
    registration_details.approve_status = "P";
    registration_details.contact_no = Number(registration_details.contact_no);
    registration_details.no_of_employees = Number(
      registration_details.no_of_employees
    );
  
    const {id, ...registration} = registration_details;

    const newRegistration = await prisma.registration.create({
      data: registration,
    });

    res.status(200).json(generateResultJson(newRegistration));
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

registrationRouter.post("/update", async (req, res) => {
  const registration_details = req.body;

  try {
    const user = req.headers["x-access-user"] as any;
    registration_details.updated_by = user["fullname"];
    registration_details.updated_date = new Date();

    const updatedRegistration = await prisma.registration.update({
      where: {
        id: registration_details.id,
      },
      data: registration_details,
    });

    res.status(200).json(generateResultJson(updatedRegistration));
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});
