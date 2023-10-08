import { PrismaClient } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
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
  const result = generateResultJson(page, size, registrations);

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

  res.status(200).json(registration);
});

registrationRouter.post("/", async (req, res) => {
  const registration_details = req.body;

  try {
    registration_details.created_by = "SYSTEM";
    registration_details.updated_by = "SYSTEM";
    registration_details.approve_status = "P";
    registration_details.contact_no = Number(registration_details.contact_no);
    registration_details.no_of_employees = Number(
      registration_details.no_of_employees
    );

    const newRegistration = await prisma.registration.create({
      data: registration_details,
    });

    res.status(200).json(newRegistration);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});
