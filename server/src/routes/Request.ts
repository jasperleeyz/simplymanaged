import { LeaveRequest, PrismaClient, Request } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { sendApproveRejectRequestEmail } from "../utils/email";

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
      prisma.request.count({where: findObject.where}),
      prisma.request.findMany(findObject),
    ]);

    requests[1].forEach((request: any) => {
      if (request.leave_request) {
        request.leave_request.attachment =
          (request.leave_request.attachment?.toString() as any) || null;
      }
    });

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

    const request = (await prisma.request.findFirst({
      where: {
        id: Number(request_id),
        company_id: Number(company_id),
        user_id: Number(user_id),
      },
      include: { leave_request: true, swap_request: true, bid_request: true },
    })) as any;

    if (request.leave_request) {
      request.leave_request.attachment =
        (request.leave_request.attachment?.toString() as any) || null;
    }

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
      remarks,
      attachment,
      no_of_days,
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
            remarks: remarks,
            attachment: Buffer.from(attachment),
            no_of_days: no_of_days,
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

requestRouter.get("/pending-request/:departmentId", async (req, res) => {
  try {
    const { page, size, sort, filter } = req.query;
    const { departmentId } = req.params;

    const logged_in_user = req.headers["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];

    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      status: "P",
      company_id: Number(company_id),
    };
    findObject.include = {
      leave_request: true,
      swap_request: true,
      bid_request: true,
    };

    // get all requests that are pending for a given department id
    // find users in that department
    const requests = (await prisma.$transaction(async (tx) => {
      return await tx.department
        .findFirst({
          where: {
            id: Number(departmentId),
            company_id: Number(company_id),
          },
          include: {
            employees: true,
          },
        })
        .then(async (department) => {
          const users = department?.employees?.map((employee) => employee.id);
          const requests_count = await tx.request.count({
            where: {
              user_id: {
                in: users,
              },
              ...findObject.where,
            },
          });

          // get all requests for those users
          const paged_request = await tx.request.findMany({
            skip: findObject.skip,
            take: findObject.take,
            where: {
              user_id: {
                in: users,
              },
              ...findObject.where,
            },
            include: findObject.include,
          });

          paged_request.forEach((request: any) => {
            if (request.leave_request) {
              request.leave_request.attachment =
                (request.leave_request.attachment?.toString() as any) || null;
            }
          });

          return [requests_count, paged_request];
        });
    })) as any[];

    return res
      .status(200)
      .json(generateResultJson(requests[1], requests[0], page, size));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting pending requests");
  }
});

requestRouter.post("/update", async (req, res) => {
  try {
    const {
      id,
      company_id,
      user_id,
      type,
      status,
      leave_request,
      swap_request,
      bid_request,
    } = req.body;

    const logged_in_user = req.headers["x-access-user"] as any;
    const user = logged_in_user["name"];

    // check if request user exists
    const request_user = await prisma.user.findFirst({
      where: {
        id: Number(user_id),
        company_id: Number(company_id),
      },
    });

    if (!request_user) {
      throw new Error("Request user not found");
    }

    // update request
    let result = {};
    let updatedRequest = {} as any;

    if (leave_request) {
      const { request_id: leave_request_id, ...leave_request_without_id } =
        leave_request;

      result = await prisma.request.update({
        where: {
          id: Number(id),
          company_id: Number(company_id),
          user_id: Number(user_id),
        },
        data: {
          type: type,
          status: status,
          updated_by: user,
          leave_request: {
            update: {
              data: leave_request_without_id,
            },
          },
        },
        include: { leave_request: true },
      });

      const leave_type = await prisma.companyCode.findFirst({
        where: {
          company_id: Number(company_id),
          code_type: "LEAVE_TYPE",
          code: leave_request_without_id.type,
        },
      });

      updatedRequest = result;
      updatedRequest.leave_request.type = leave_type?.description;
    }

    if (swap_request) {
      const { request_id: swap_request_id, ...swap_request_without_id } =
        swap_request;

      result = await prisma.request.update({
        where: {
          id: Number(id),
          company_id: Number(company_id),
          user_id: Number(user_id),
        },
        data: {
          type: type,
          status: status,
          updated_by: user,
          swap_request: {
            update: {
              data: swap_request_without_id,
            },
          },
        },
        include: { swap_request: true },
      });

      updatedRequest = result;
    }

    if (bid_request) {
      const { request_id: bid_request_id, ...bid_request_without_id } =
        bid_request;

      result = await prisma.request.update({
        where: {
          id: Number(id),
          company_id: Number(company_id),
          user_id: Number(user_id),
        },
        data: {
          type: type,
          status: status,
          updated_by: user,
          bid_request: {
            update: {
              data: bid_request_without_id,
            },
          },
        },
        include: { bid_request: true },
      });

      updatedRequest = result;
    }

    if (status !== "P") {
      // send email to requester
      await sendApproveRejectRequestEmail(
        request_user?.email,
        request_user?.fullname,
        type,
        status,
        updatedRequest
      );
    }
    
    return res.status(200).json(generateResultJson(result));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error updating request");
  }
});

// api to retrieve leave balance
requestRouter.get("/leave-balance", async (req, res) => {
  const logged_in_user = req.headers["x-access-user"] as any;
  const company_id = logged_in_user["company_id"];
  const user_id = logged_in_user["user_id"];

  const leave_type = req.query.leave_type as string;

  try {
    const leave_balance = await prisma.companyLeaveBalance.findFirst({
      where: {
        company_id: Number(company_id),
        leave_type: leave_type,
      },
    });

    if(!leave_balance) {
      throw new Error("Leave balance not found");
    }

    // find all pending and approved leave request for the user
    const requests = await prisma.request.findMany({
      where: {
        company_id: Number(company_id),
        user_id: Number(user_id),
        type: "LEAVE",
        status: {
          in: ["P", "A"],
        },
        leave_request: {
          type: leave_type,
        }
      },
      include: {
        leave_request: true,
      },
    });

    let total_requested_days = 0.0;
    for (const request of requests) {
      total_requested_days += Number(request?.leave_request?.no_of_days) || 0.0;
    }

    const result = leave_balance.balance - total_requested_days;

    return res.status(200).json(generateResultJson(result));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting leave balance");
  }
});

requestRouter.get("/:requestId", async (req, res) => {
  try {
    const request_id = req.params?.requestId;

    const request = (await prisma.request.findFirst({
      where: {
        id: Number(request_id),
      },
      include: { leave_request: true, swap_request: true, bid_request: true },
    })) as any;

    if (request.leave_request) {
      request.leave_request.attachment =
        (request.leave_request.attachment?.toString() as any) || null;
    }

    return res.status(200).json(generateResultJson(request));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting personal requests");
  }
});

