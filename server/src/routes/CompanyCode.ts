import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const companyCodeRouter = express.Router();

const prisma = new PrismaClient();

companyCodeRouter.get("/:company_id", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;
  const { company_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
        ...findObject.where,
        company_id: Number(company_id),
    };

    const companyCodes = await prisma.$transaction([
      prisma.companyCode.count(...findObject.where),
      prisma.companyCode.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(
      companyCodes[1],
      companyCodes[0],
      page,
      size
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving company codes.");
  }
});
