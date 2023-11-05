import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const codeTypeRouter = express.Router();

const prisma = new PrismaClient();

codeTypeRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);

    const codeTypes = await prisma.$transaction([
      prisma.codeType.count({where: findObject.where}),
      prisma.codeType.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(codeTypes[1], codeTypes[0], page, size);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving code types.");
  }
});
