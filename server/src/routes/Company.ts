import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { SUBSCRIPTION_STATUS, USER_STATUS } from "../utils/constants";

export const companyRouter = express.Router();

const prisma = new PrismaClient();

companyRouter.get("/:company_id", async (req, res) => {
  const { company_id } = req.params;

  try {
    const company = await prisma.company.findUnique({
      where: {
        id: Number(company_id),
      },
      include: {
        subscriptions: {
          where: {
            "status": SUBSCRIPTION_STATUS.ACTIVE,
          },
        },
      },
    }) as any;

    const total_no_of_employees = await prisma.user.count({
      where: {
        company_id: Number(company_id),
        status: USER_STATUS.ACTIVE,
      },
    });

    company['actual_no_of_employees'] = total_no_of_employees;

    return res.status(200).json(generateResultJson(company));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving company.");
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

    return res.status(200).json(generateResultJson(company));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving company.");
  }
});
