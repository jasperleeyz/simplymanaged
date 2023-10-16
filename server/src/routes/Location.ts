import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const locationRouter = express.Router();

const prisma = new PrismaClient();