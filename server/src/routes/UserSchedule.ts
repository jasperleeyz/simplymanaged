import { PrismaClient, UserSchedule } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { ValidationError } from "../errors/validation-error";

export const UserScheduleRouter = express.Router();

const prisma = new PrismaClient();


UserScheduleRouter.get(
  "/get-schedule/:user_company_id/:user_id",
  async (req, res) => {
    const { page, size, sort, filter } = req.query;
    const { user_company_id, user_id } = req.params;

    try {
      const findObject = generateFindObject(page, size, sort, filter);
      findObject.where = {
        ...findObject.where,
        user_company_id: Number(user_company_id),
        user_id: Number(user_id),
      };

      const UserSchedules = await prisma.$transaction([
        prisma.userSchedule.count({ where: findObject.where }),
        prisma.userSchedule.findMany(findObject),
      ]);

      // create result object
      const result = generateResultJson(
        UserSchedules[1],
        UserSchedules[0],
        page,
        size
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).send("Error retrieving user schedules.");
    }
  }
);

UserScheduleRouter.get(
  "/get-schedule/:user_company_id/:month/:year",
  async (req, res) => {
    const { page, size, sort, filter } = req.query;
    const { user_company_id, month, year } = req.params;

    try {
      // Calculate the start and end dates for the selected month and year
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      // Fetch user schedules for the specified month and year
      const userSchedules = await prisma.userSchedule.findMany({
        where: {
          user_company_id: Number(user_company_id),
          start_date: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          user: true, // Include the user data
          start_date: true,
        },
      });

      // Group user schedules by day
      const userSchedulesByDay: { [day: number]: Array<string> } = {};
      userSchedules.forEach((schedule) => {
        const day = schedule.start_date.getDate();
        if (!userSchedulesByDay[day]) {
          userSchedulesByDay[day] = [];
        }
        userSchedulesByDay[day].push(schedule.user.fullname); // Use the specific property you want (e.g., fullname)
      });

      // Create the result object with users grouped by day
      const result: { [key: string]: string[] } = {};
      for (const day in userSchedulesByDay) {
        const dayString = `${day} - ${month} - ${year}`;
        result[dayString] = userSchedulesByDay[day].map((fullname) => fullname); // Adjust this based on your user data structure.
      }

      const resultz = generateResultJson(result);
      return res.status(200).json(resultz);
    } catch (error) {
      console.error(error);
      return res.status(400).send("Error retrieving user schedules.");
    }
  }
);
/*
UserScheduleRouter.get(
  "/get-non-conflict-user/:user_company_id/:deparment_id/:start_date/:end_date",
  async (req, res) => {
    const { page, size, sort, filter } = req.query;
    const { user_company_id, deparment_id, start_date, end_date } = req.params;

    try {
      const findObject = generateFindObject(page, size, sort, filter);
      findObject.where = {
        ...findObject.where,
        company_id: Number(user_company_id),
        department_id: Number(deparment_id)
      };

      // Fetch schedules that do not conflict with the specified date range
      const nonConflictingSchedules = await prisma.$transaction([
        prisma.userSchedule.findMany({
          where: {
            user_company_id: Number(user_company_id),
            start_date: { lte: new Date(end_date) }, // Start date is before the end date
            end_date: { gte: new Date(start_date) }, // End date is after the start date
          },
        }),
      ]);
      const nonConflictingUserIds = nonConflictingSchedules[0].map(
        (schedule) => schedule.user_id
      );
      const allUsers = await prisma.user.findMany(findObject);

      // Filter out users with non-conflicting schedules
      const usersWithoutConflicts = allUsers.filter(
        (user) => !nonConflictingUserIds.includes(user.id)
      );

      const result = generateResultJson(
        usersWithoutConflicts,
        usersWithoutConflicts.length,
        page,
        size
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).send("Error checking user schedules for conflicts.");
    }
  }
);
*/
UserScheduleRouter.get(
  "/get-non-conflict-user/:user_company_id/:department_id/:start_date/:end_date",
  async (req, res) => {
    const { user_company_id, department_id, start_date, end_date } = req.params;

    try {
      const firstDay = new Date(start_date);
      firstDay.setDate(firstDay.getDate() - firstDay.getDay());

      const lastDay = new Date(end_date);
      lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

      const rawWeekSchedule: { id: number; user_id: number; user_company_id: number; roster_id: number; start_date: Date; end_date: Date; shift: string; status: string; created_by: string; created_date: Date; updated_by: string; updated_date: Date; }[][] = await prisma.$transaction([
        prisma.userSchedule.findMany({
          where: {
            user_company_id: Number(user_company_id),
            start_date: { gte: firstDay },
            end_date: { lte: lastDay },
          },
        }),
      ]);

      const getWeekSchedule: UserSchedule[] = rawWeekSchedule.flat();

      const employeeIdTaggedHour: Record<number, number> = {};
      getWeekSchedule.forEach((entry: UserSchedule) => {
        const { user_id, shift, start_date } = entry;

        let hours = 0;

        if (shift === 'AM' || shift === 'PM') {
          // If shift is AM or PM, add 4 hours
          hours = 4;
        } else if (shift === 'FULL') {
          // If shift is full, add 8 hours
          hours = 8;
        }
        if (!employeeIdTaggedHour[user_id]) {
          employeeIdTaggedHour[user_id] = 0;
      }

        employeeIdTaggedHour[user_id] = employeeIdTaggedHour[user_id] + hours;
      });

      // Fetch schedules that do not conflict with the specified date range
      const nonConflictingSchedules = await prisma.$transaction([
        prisma.userSchedule.findMany({
          where: {
            user_company_id: Number(user_company_id),
            start_date: { lte: new Date(end_date) },
            end_date: { gte: new Date(start_date) },
          },
        }),
      ]);

      const nonConflictingUserIds = nonConflictingSchedules[0].map(
        (schedule) => schedule.user_id
      );

      const employees = await prisma.$transaction([
        prisma.user.findMany({
          where: {
            NOT: {
              id: {
                in: nonConflictingUserIds,
              },
            },
            company_id: Number(user_company_id),
            department_id: Number(department_id),
          },
          include: {
            employment_details: true,
          },
        }),
      ]);

      const employeesWithWorkingHours = employees.flat().filter((employee) => {
        const employeeWorkingHours = employee.employment_details?.working_hours || 0;
        const dataWorkingHours = employeeIdTaggedHour[employee.id] || 0;

        // Include the employee if their working hours are greater than the data
        return Number(employeeWorkingHours) > Number(dataWorkingHours);
      });

      const employeesWithWorkingHoursFix = employeesWithWorkingHours.map(item => ({
        ...item,
        profile_image :item.profile_image?.toString() ?? ""
      }));

      res.status(200).json(generateResultJson(employeesWithWorkingHoursFix));
    } catch (error) {
      console.error(error);
      res.status(400).send("Error checking user schedules for conflicts.");
    }
  }
);

UserScheduleRouter.get(
  "/get-non-conflict-user-roster/:user_company_id/:department_id/:roster_id/:start_date/:end_date",
  async (req, res) => {
    const { user_company_id, department_id, roster_id, start_date, end_date } = req.params;

    try {
      const firstDay = new Date(start_date);
      firstDay.setDate(firstDay.getDate() - firstDay.getDay());

      const lastDay = new Date(end_date);
      lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

      const rawWeekSchedule: { id: number; user_id: number; user_company_id: number; roster_id: number; start_date: Date; end_date: Date; shift: string; status: string; created_by: string; created_date: Date; updated_by: string; updated_date: Date; }[][] = await prisma.$transaction([
        prisma.userSchedule.findMany({
          where: {
            user_company_id: Number(user_company_id),
            start_date: { gte: firstDay },
            end_date: { lte: lastDay },
          },
        }),
      ]);

      const getWeekSchedule: UserSchedule[] = rawWeekSchedule.flat();

      const employeeIdTaggedHour: Record<number, number> = {};
      getWeekSchedule.forEach((entry: UserSchedule) => {
        const { user_id, shift, start_date } = entry;

        let hours = 0;

        if (shift === 'AM' || shift === 'PM') {
          // If shift is AM or PM, add 4 hours
          hours = 4;
        } else if (shift === 'FULL') {
          // If shift is full, add 8 hours
          hours = 8;
        }
        if (!employeeIdTaggedHour[user_id]) {
          employeeIdTaggedHour[user_id] = 0;
      }

        employeeIdTaggedHour[user_id] = employeeIdTaggedHour[user_id] + hours;
      });

      // Fetch schedules that do not conflict with the specified date range
      const nonConflictingSchedules = await prisma.$transaction([
        prisma.userSchedule.findMany({
          where: {
            user_company_id: Number(user_company_id),
            start_date: { lte: new Date(end_date) },
            end_date: { gte: new Date(start_date) },
          },
        }),
      ]);

      const nonConflictingUserIds = nonConflictingSchedules[0].map(
        (schedule) => schedule.user_id
      );

      const employees = await prisma.$transaction([
        prisma.user.findMany({
          where: {
            NOT: {
              id: {
                in: nonConflictingUserIds,
              },
            },
            company_id: Number(user_company_id),
            department_id: Number(department_id),
          },
          include: {
            employment_details: true,
          },
        }),
      ]);

      const employeesWithWorkingHours = employees.flat().filter((employee) => {
        const employeeWorkingHours = employee.employment_details?.working_hours || 0;
        const dataWorkingHours = employeeIdTaggedHour[employee.id] || 0;

        // Include the employee if their working hours are greater than the data
        return Number(employeeWorkingHours) > Number(dataWorkingHours);
      });

      const rosterUsers = await prisma.userSchedule.findMany({
        where: {
          roster_id: Number(roster_id),
        },
        include: {
          user: true,
        },
      });

      // Extract user data from the rosterUsers
      const rosterUserIds = rosterUsers.map((schedule) => schedule.user.id);

      // Query users based on the rosterUserIds
      const usersFromRoster = await prisma.user.findMany({
        where: {
          id: {
            in: rosterUserIds,
          },
        },
      });

      // Combine the results from usersWithoutConflicts and usersFromRoster
      const combinedUsers = [...employeesWithWorkingHours, ...usersFromRoster];

      return res.status(200).json(generateResultJson(combinedUsers));
    } catch (error) {
      console.error(error);
      return res.status(400).send("Error checking user schedules for conflicts.");
    }
  }
);

UserScheduleRouter.post("/create", async (req, res) => {
  try {
    const {
      user_id,
      user_company_id,
      roster_id,
      start_date,
      end_date,
      shift,
      status,
      created_by,
      updated_by,
    } = req.body;

    const newSchedule = await prisma.$transaction(async (tx) => {
      const createdSchedule = await tx.userSchedule.create({
        data: {
          user_id,
          user_company_id,
          roster_id,
          start_date,
          end_date,
          shift,
          status,
          created_by,
          updated_by,
        },
      });
      return res.status(200).json({
        schedule: createdSchedule,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error creating schedule.");
  }
});

UserScheduleRouter.get(
  "/get-schedule-from-to/:companyId/:userId",
  async (req, res) => {
    try {
      const { companyId, userId } = req.params;
      const { from, to } = req.query;

      const userSchedules = await prisma.userSchedule.findMany({
        where: {
          user_company_id: Number(companyId),
          user_id: Number(userId),
          start_date: {
            gte: from as string,
            lte: to as string,
          },
        },
        include: {
          roster: {
            select: {
              location_id: true,
              type: true,
            },
          },
        },
      });

      return res.status(200).json(generateResultJson(userSchedules));
    } catch (error) {
      console.error(error);
      return res.status(400).send("Error retrieving user schedules.");
    }
  }
);

UserScheduleRouter.get("/all-upcoming-shift-schedules", async (req, res) => {
  try {
    const logged_in_user = req.headers["x-access-user"] as any;
    const user_id = logged_in_user.user_id;
    const user_company_id = logged_in_user.company_id;

    const schedules = await prisma.userSchedule.findMany({
      where: {
        user_company_id: Number(user_company_id),
        user_id: Number(user_id),
        start_date: {
          gt: new Date(),
        },
        end_date: {
          equals: prisma.userSchedule.fields.start_date,
        },
      },
    });

    return res.status(200).json(generateResultJson(schedules));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving upcoming shift schedules.");
  }
});

UserScheduleRouter.get(
  "/available-shift-schedules-for-swapping",
  async (req, res) => {
    try {
      const logged_in_user = req.headers["x-access-user"] as any;
      const user_id = logged_in_user.user_id;
      const user_company_id = logged_in_user.company_id;
      const { shift, date } = req.query;

      // verify if shift and date is present
      if (!shift || !date) {
        throw new ValidationError("Shift and date are required.");
      }

      // get current user profile
      const current_user = await prisma.user.findUnique({
        where: {
          id_company_id: {
            id: Number(user_id),
            company_id: Number(user_company_id),
          },
        },
      });

      // only retrieve schedules that are full shift and not same date as the selected schedule's date
      // if the selected schedule for swapping is full shift
      if ((shift as string).toUpperCase() === "FULL") {
        const schedules = await prisma.userSchedule.findMany({
          where: {
            user_company_id: Number(user_company_id),
            user_id: {
              not: Number(user_id),
            },
            start_date: {
              gt: new Date(date as string),
            },
            end_date: {
              equals: prisma.userSchedule.fields.start_date,
            },
            shift: {
              equals: (shift as string).toUpperCase(),
            },
            user: {
              department_id: {
                equals: current_user?.department_id,
              },
              position: {
                equals: current_user?.position,
              }
            }
          },
          include: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        });

        return res.status(200).json(generateResultJson(schedules));
      }

      // if the selected schedule for swapping is not full shift
      // then retrieve schedules that are not full shift
      let schedules = await prisma.userSchedule.findMany({
        where: {
          user_company_id: Number(user_company_id),
          user_id: {
            not: Number(user_id),
          },
          start_date: {
            gte: new Date(date as string),
          },
          end_date: {
            equals: prisma.userSchedule.fields.start_date,
          },
          shift: {
            not: "FULL",
          },
          user: {
            department_id: {
              equals: current_user?.department_id,
            },
            position: {
              equals: current_user?.position,
            }
          }
        },
        include: {
          user: {
            select: {
              fullname: true,
            },
          },
        },
      });

      // then filter out schedules that are same date and same shift as the selected schedule for swapping
      schedules = schedules.filter(
        (schedule) =>
          !(
            schedule.start_date.toISOString().split("T")[0] === date &&
            schedule.shift === shift
          )
      );

      return res.status(200).json(generateResultJson(schedules));
    } catch (error) {
      console.error(error);
      let message = "Error retrieving available shift schedules for swapping.";
      if (error instanceof ValidationError) {
        message = error.message;
      }
      return res.status(400).send(message);
    }
  }
);

