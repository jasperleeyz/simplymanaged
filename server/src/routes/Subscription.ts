import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const subscriptionRouter = express.Router();

const prisma = new PrismaClient();

subscriptionRouter.get("/model/all", async (req, res) => {
  try {
    const result = await prisma.subscriptionModel.findMany({});
    return res.status(200).json(generateResultJson(result));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving subscriptions");
  }
});

subscriptionRouter.get("/model/:id", async (req, res) => {
  try {
    const subscription_model = await prisma.subscriptionModel.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    return res.status(200).json(generateResultJson(subscription_model));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving subscription details");
  }
});

subscriptionRouter.get("/model/:company_id", async (req, res) => {
  try {
    const subscription = await prisma.subscription.findMany({
      where: {
        company_id: Number(req.params.company_id),
      },
    });
    return res.status(200).json(generateResultJson(subscription));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving subscription details");
  }
});
