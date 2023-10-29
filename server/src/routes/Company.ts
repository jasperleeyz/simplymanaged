import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const companyRouter = express.Router();

const prisma = new PrismaClient();

companyRouter.get("/:company_id", async (req, res) => {
  const { company_id } = req.params;

  try {
    const company = await prisma.company.findUnique({
      where: {
        id: Number(company_id),
      },
    });

    res.status(200).json(generateResultJson(company));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving company.");
  }
});

companyRouter.post("/update/:company_id", async (req, res) => {
  const { company_id } = req.params;
  const { address, contact_no, email, name, uen, industry } = req.body;
  const logged_in_user = req.headers?.["x-access-user"] as any;

  try {
    const company = await prisma.company.update({
      where: {
        id: Number(company_id),
      },
      data: {
        address,
        contact_no,
        email,
        name,
        uen,
        industry,
        updated_by: logged_in_user?.name,
      },
    });

    res.status(200).json(generateResultJson(company));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving company.");
  }
});
