import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const codeTypeRouter = express.Router();

const prisma = new PrismaClient();

codeTypeRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  const findObject = generateFindObject(page, size, sort, filter);

  const codeTypes = await prisma.$transaction([
    prisma.codeType.count(),
    prisma.codeType.findMany(findObject),
  ]);

  // create result object
  const result = generateResultJson(page, size, codeTypes);

  res.status(200).json(result);
});
