import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const companyCodeTypeRouter = express.Router();

const prisma = new PrismaClient();

companyCodeTypeRouter.get("/:company_id", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;
  const { company_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      company_id: Number(company_id),
    };

    const companyCodeTypes = await prisma.$transaction([
      prisma.companyCodeType.count(...findObject.where),
      prisma.companyCodeType.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(
      companyCodeTypes[1],
      companyCodeTypes[0],
      page,
      size
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving company code types.");
  }
});
