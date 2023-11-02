import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const requestRouter = express.Router();

const prisma = new PrismaClient();

requestRouter.get("/personal-request", async (req, res) => {
  try {
    const { page, size, sort, filter } = req.query;

    const logged_in_user = req.headers["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];
    const user_id = logged_in_user["user_id"];

    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      company_id: Number(company_id),
      user_id: Number(user_id),
    };
    findObject.include = {
      leave_request: true,
      swap_request: true,
      bid_request: true,
    };

    const requests = await prisma.$transaction([
      prisma.request.count(...findObject.where),
      prisma.request.findMany(findObject),
    ]);

    return res
      .status(200)
      .json(generateResultJson(requests[1], requests[0], page, size));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting personal requests");
  }
});

requestRouter.get("/personal-request/:requestId", async (req, res) => {
  try {
    const request_id = req.params?.requestId;

    const logged_in_user = req.headers["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];
    const user_id = logged_in_user["user_id"];

    const request = await prisma.request.findFirst({
      where: {
        id: Number(request_id),
        company_id: Number(company_id),
        user_id: Number(user_id),
      },
      include: { leave_request: true, swap_request: true, bid_request: true },
    });

    return res.status(200).json(generateResultJson(request));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting personal requests");
  }
});

requestRouter.post("/create-leave/:companyId/:userId", async (req, res) => {
  try {
    const { companyId, userId } = req.params;
    const {
      leave_type,
      start_date,
      end_date,
      half_day,
      status,
      total_leave_days,
    } = req.body;
    const logged_in_user = req.headers["x-access-user"] as any;

    const result = await prisma.request.create({
      data: {
        company_id: Number(companyId),
        user_id: Number(userId),
        type: "LEAVE",
        status: status,
        created_by: logged_in_user["name"],
        updated_by: logged_in_user["name"],
        leave_request: {
          create: {
            type: leave_type,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            half_day: half_day,
          },
        },
      },
    });

    return res.status(200).json(generateResultJson(result));
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send("Error creating leave request. Please try again later.");
  }
});
