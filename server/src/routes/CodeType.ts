import { PrismaClient } from "@prisma/client";
import express from "express";

export const codeTypeRouter = express.Router();

const prisma = new PrismaClient();

codeTypeRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;
  const codes = await prisma.$transaction([
    prisma.codeType.count(),
    prisma.codeType.findMany({
      skip: (Number(page) - 1) * Number(size),
      take: Number(size),
    }),
  ]);

  res.status(200).json({
    total: codes[0],
    page: Number(page),
    totalPages: Math.ceil(codes[0] / Number(size)),
    data: codes[1],
  });
});