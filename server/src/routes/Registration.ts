import { PrismaClient } from "@prisma/client";
import express from "express";

export const registrationRouter = express.Router();

const prisma = new PrismaClient();

registrationRouter.get("/", async (req, res) => {
  
    const { page, size, sort, filter, cursor } = req.query;
    const registrations = await prisma.$transaction([
        prisma.registration.count(),
        prisma.registration.findMany({
            skip: Number(page) * Number(size),
            take: Number(size),
        }),
    ]);

    res.status(200).json({
        total: registrations[0],
        page: Number(page),
        registrations: registrations[1],
    });
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
      res
        .status(404)
        .json({
          message: `Registration details with ID ${id} does not exist in the database`,
        });
    });

  res.status(200).json(registration);
});
