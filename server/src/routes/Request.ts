import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { sendApproveRejectRequestEmail } from "../utils/email";
import { ValidationError } from "../errors/validation-error";

export const requestRouter = express.Router();

const prisma = new PrismaClient();

const generateScheduleInfoForSwapRequest = async (swap_request: any) => {
  const requester_schedule = await prisma.userSchedule.findFirst({
    where: {
      id: swap_request.requester_schedule_id,
    },
    select: {
      id: true,
      user_id: true,
      shift: true,
      start_date: true,
      end_date: true,
      // roster: {
      //   select: {
      //     id: true,
      //     location: {
      //       select: {
      //         name: true,
      //       },
      //     },
      //   },
      // },
    },
  });

  const requested_schedule = await prisma.userSchedule.findFirst({
    where: {
      id: swap_request.requested_schedule_id,
    },
    select: {
      id: true,
      user_id: true,
      shift: true,
      start_date: true,
      end_date: true,
      roster: {
        select: {
          location_id: true,
        },
      },
      // roster: {
      //   select: {
      //     id: true,
      //     location: {
      //       select: {
      //         name: true,
      //       },
      //     },
      //   },
      // },
      user: {
        select: {
          fullname: true,
        },
      },
    },
  });

  swap_request.requester_schedule = requester_schedule;
  swap_request.requested_schedule = requested_schedule;
};

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
      prisma.request.count({ where: findObject.where }),
      prisma.request.findMany(findObject),
    ]);

    for (const request of requests[1]) {
      if ((request as any).leave_request) {
        (request as any).leave_request.attachment =
          ((request as any).leave_request.attachment?.toString() as any) ||
          null;
      }

      if ((request as any).swap_request) {
        await generateScheduleInfoForSwapRequest((request as any).swap_request);
      }
    }

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

    if ((request as any).leave_request) {
      (request as any).leave_request.attachment =
        ((request as any).leave_request.attachment?.toString() as any) || null;
    }

    if ((request as any).swap_request) {
      await generateScheduleInfoForSwapRequest((request as any).swap_request);
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

requestRouter.get("/pending-request/manager", async (req, res) => {
  try {
    const { page, size, sort, filter } = req.query;
    const logged_in_user = req.headers["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];
    const user_id = logged_in_user["user_id"];

    // retrieve logged in manager's profile
    const manager = await prisma.user.findFirst({
      where: {
        id: Number(user_id),
        company_id: Number(company_id),
      },
      include: {
        department: {
          include: {
            employees: {
              select: {
                id: true,
              },
            },
          },
        },
        department_in_charge: true,
      },
    });

    const is_head_of_department = manager?.department_in_charge !== null;

    const findObject = generateFindObject(page, size, sort, filter);

    // for head-of-department, will have the ability to approve leave requests for all employees in the department,
    // approve swap requests, and approve bid requests
    if (is_head_of_department) {
      findObject.where = {
        OR: [
          {
            type: "SWAP",
            swap_request: {
              requested_user_id: Number(logged_in_user["user_id"]),
            },
          },
          {
            type: "BID",
          },
          {
            type: "LEAVE",
            user_id: {
              in: manager?.department?.employees?.map(
                (employee) => employee.id
              ),
            },
          },
        ],
        AND: {
          status: "P",
          company_id: Number(company_id),
        },
      };
    } else {
      // for non-head-of-department, will only be able to approve swap and bid requests
      findObject.where = {
        OR: [
          {
            type: "SWAP",
            swap_request: {
              requested_user_id: Number(logged_in_user["user_id"]),
            },
          },
          {
            type: "BID",
          },
        ],
        AND: {
          status: "P",
          company_id: Number(company_id),
        },
      };
    }
    findObject.include = {
      leave_request: true,
      swap_request: true,
      bid_request: true,
    };

    const requests = await prisma.$transaction([
      prisma.request.count({ where: findObject.where }),
      prisma.request.findMany(findObject),
    ]);

    for (const request of requests[1]) {
      if ((request as any).leave_request) {
        (request as any).leave_request.attachment =
          ((request as any).leave_request.attachment?.toString() as any) ||
          null;
      }

      if ((request as any).swap_request) {
        await generateScheduleInfoForSwapRequest((request as any).swap_request);
      }
    }

    return res
      .status(200)
      .json(generateResultJson(requests[1], requests[0], page, size));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting pending requests");
  }
});

requestRouter.get("/pending-request/employee", async (req, res) => {
  try {
    const { page, size, sort, filter } = req.query;
    const logged_in_user = req.headers["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];

    // for employee, will be able to approve swap requests only
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      status: "P",
      company_id: Number(company_id),
      type: "SWAP",
      swap_request: {
        requested_user_id: Number(logged_in_user["user_id"]),
      },
    };
    findObject.include = {
      swap_request: true,
    };

    const requests = await prisma.$transaction([
      prisma.request.count({ where: findObject.where }),
      prisma.request.findMany(findObject),
    ]);

    for (const request of requests[1]) {
      if ((request as any).swap_request) {
        await generateScheduleInfoForSwapRequest((request as any).swap_request);
      }
    }

    return res
      .status(200)
      .json(generateResultJson(requests[1], requests[0], page, size));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting pending requests");
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
      const { request_id: swap_request_id, requester_schedule, requested_schedule, ...swap_request_without_id } =
        swap_request;

      result = await prisma.$transaction(async (tx) => {

        // check if its approved
        if(status === "A") {
          // swap the requests
          // update requester schedule's user id to requested user id
          await tx.userSchedule.update({
            where: {
              id: Number(swap_request_without_id.requester_schedule_id),
              user_company_id: Number(company_id),
              user_id: Number(swap_request_without_id.requester_user_id),
            },
            data: {
              user_id: Number(swap_request_without_id.requested_user_id),
            }
          });

          // update requested schedule's user id to requester user id
          await tx.userSchedule.update({
            where: {
              id: Number(swap_request_without_id.requested_schedule_id),
              user_company_id: Number(company_id),
              user_id: Number(swap_request_without_id.requested_user_id),
            },
            data: {
              user_id: Number(swap_request_without_id.requester_user_id),
            }
          });
        }

        // update request status
        return await tx.request.update({
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
      });

      updatedRequest = result;
      await generateScheduleInfoForSwapRequest((updatedRequest as any).swap_request);
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

    if (!leave_balance) {
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
        },
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

requestRouter.post("/create-swap", async (req, res) => {
  try {
    const logged_in_user = req.headers["x-access-user"] as any;
    const user = logged_in_user["name"];
    const {
      reason,
      requester_schedule_id,
      requested_user_id,
      requested_schedule_id,
    } = req.body;

    // if(!reason || !requester_schedule_id || !requested_user_id || !requested_schedule_id) {
    //   throw new ValidationError("Required fields are missing.");
    // } else
    if (Number(requester_schedule_id) === Number(requested_schedule_id)) {
      throw new ValidationError(
        "Selected schedule is the same as your schedule."
      );
    } else if (
      Number(requested_user_id) === Number(logged_in_user["user_id"])
    ) {
      throw new ValidationError("Not allowed to swap your own schedule.");
    }

    // check if there's a duplicate swap request
    const existing_swap_request = await prisma.request.findFirst({
      where: {
        company_id: Number(logged_in_user["company_id"]),
        user_id: Number(logged_in_user["user_id"]),
        type: "SWAP",
        status: "P",
        swap_request: {
          requester_user_id: Number(logged_in_user["user_id"]),
          requester_schedule_id: Number(requester_schedule_id),
          requested_user_id: Number(requested_user_id),
          requested_schedule_id: Number(requested_schedule_id),
        },
      },
    });

    if (existing_swap_request) {
      throw new ValidationError("There is already an existing request.");
    }

    const result = await prisma.request.create({
      data: {
        company_id: Number(logged_in_user["company_id"]),
        user_id: Number(logged_in_user["user_id"]),
        type: "SWAP",
        status: "P",
        created_by: user,
        updated_by: user,
        swap_request: {
          create: {
            reason: reason,
            requester_user_id: Number(logged_in_user["user_id"]),
            requester_schedule_id: Number(requester_schedule_id),
            requested_user_id: Number(requested_user_id),
            requested_schedule_id: Number(requested_schedule_id),
          },
        },
      },
    });

    return res.status(200).json(generateResultJson(result));
  } catch (error) {
    console.error(error);
    let message = "Error creating swap request. Please try again later.";
    if (error instanceof ValidationError) {
      message = error.message;
    }
    res.status(400).send(message);
  }
});

const checkIfRosterIsOpenForBidding = (roster: any, user_pos: string, selected_shift: string) => {
  const employeePositionsCount = {} as any;
  const user_schedule = roster.schedules;
  const positions = roster.positions;

  user_schedule.forEach((schedule: any) => {
    if (employeePositionsCount[schedule.user.position]) {
      employeePositionsCount[schedule.user.position]["count"] +=
        schedule.shift.toUpperCase() === "FULL" ? 1 : 0.5;
      if (employeePositionsCount[schedule.user.position][schedule.shift])
        employeePositionsCount[schedule.user.position][schedule.shift] += 1;
      else employeePositionsCount[schedule.user.position][schedule.shift] = 1;
    } else {
      employeePositionsCount[schedule.user.position] = {};
      employeePositionsCount[schedule.user.position]["count"] =
        schedule.shift.toUpperCase() === "FULL" ? 1 : 0.5;
      employeePositionsCount[schedule.user.position][schedule.shift] = 1;
    }
  });

  positions.forEach((position: any) => {
    employeePositionsCount[position.position]["count"] =
      position.count - employeePositionsCount[position.position]["count"];
  });

  let shifts = [] as string[];

  if (employeePositionsCount[user_pos]["count"] === 0.5) {
    if (
      employeePositionsCount[user_pos]["AM"] <
      employeePositionsCount[user_pos]["PM"]
    ) {
      shifts = ["AM"];
    } else {
      shifts = ["PM"];
    }
  } else if (employeePositionsCount[user_pos]["count"] >= 1) {
    shifts = ["FULL", "AM", "PM"];
  }

  if(shifts.includes(selected_shift.toUpperCase())) {
    return true;
  } 
  
  return false;

}

requestRouter.post("/create-bid", async (req, res) => {
  try {
    const logged_in_user = req.headers["x-access-user"] as any;
    const user_name = logged_in_user["name"];
    const company_id = logged_in_user["company_id"];
    const user_id = logged_in_user["user_id"];
    const { request_shift, roster_id } = req.body;

    if(!request_shift || !roster_id) {
      throw new ValidationError("Required fields are missing.");
    }

    const user = await prisma.user.findFirst({
      where: {
        id: Number(user_id),
        company_id: Number(company_id),
      },
      select: {
        id: true,
        company_id: true,
        fullname: true,
        position: true,
      }
    });

    // check if bid request already exists
    const existing_bid_request = await prisma.request.findFirst({
      where: {
        company_id: Number(company_id),
        user_id: Number(user_id),
        type: "BID",
        status: "P",
        bid_request: {
          requested_roster_id: Number(roster_id),
          // shift: request_shift,
        },
      },
    });

    if(existing_bid_request) {
      throw new ValidationError("You already have an existing bid request for the selected roster.");
    }

    // validate and ensure that the roster is still open for bidding
    const roster = await prisma.roster.findFirst({
      where: {
        id: Number(roster_id),
        company_id: Number(company_id),
      },
      select: {
        id: true,
        start_date: true,
        end_date: true,
        positions: true,
        schedules: {
          select: {
            id: true,
            shift: true,
            user: {
              select: {
                id: true,
                position: true,
              },
            },
          },
        }
      }
    });

    if(roster) {
      if(checkIfRosterIsOpenForBidding(roster, user?.position || "", request_shift)) {
        const result = await prisma.request.create({
          data: {
            company_id: Number(company_id),
            user_id: Number(user_id),
            type: "BID",
            status: "P",
            created_by: user_name,
            updated_by: user_name,
            bid_request: {
              create: {
                requested_roster_id: Number(roster_id),
                start_date: roster.start_date,
                end_date: roster.end_date,
                shift: request_shift,
              },
            },
          },
        });
    
        return res.status(200).json(generateResultJson(result));
      } else {
        throw new ValidationError("Sorry, the position has been filled.");
      }
    } else {
      throw new ValidationError("Roster not found.");
    }
  } catch (error) {
    console.error(error);
    let message = "Error creating bid request. Please try again later.";
    if (error instanceof ValidationError) {
      message = error.message;
    }
    res.status(400).send(message);
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

    if ((request as any).swap_request) {
      await generateScheduleInfoForSwapRequest((request as any).swap_request);
    }

    return res.status(200).json(generateResultJson(request));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting personal requests");
  }
});
