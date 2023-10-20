import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const UserScheduleRouter = express.Router();

const prisma = new PrismaClient();

UserScheduleRouter.get("/:user_company_id/:user_id", async (req, res) => {
  const { page, size, sort, filter } = req.query;
  const { user_company_id, user_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      user_company_id: Number(user_company_id),
      user_id: Number(user_id)
    };

    const UserSchedules = await prisma.$transaction([
      prisma.userSchedule.count(...findObject.where),
      prisma.userSchedule.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(
      UserSchedules[1],
      UserSchedules[0],
      page,
      size
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving user schedules.");
  }
});

UserScheduleRouter.get("/:user_company_id/:start_date/:end_date", async (req, res) => {
    const { page, size, sort, filter } = req.query;
    const { user_company_id, start_date, end_date } = req.params;
  
    try {
        const findObject = generateFindObject(page, size, sort, filter);
        findObject.where = {
            ...findObject.where,
            company_id: Number(user_company_id),
        };

        // Fetch schedules that do not conflict with the specified date range
        const nonConflictingSchedules = await prisma.$transaction([
            prisma.userSchedule.findMany({
                where: {
                    user_company_id: Number(user_company_id),
                    OR: [
                        {
                            start_date: { lt: new Date(end_date) }, // Start date is before the end date
                            end_date: { gt: new Date(start_date) }, // End date is after the start date
                        }
                    ]
                }
            })
        ]);

        const nonConflictingUserIds = nonConflictingSchedules[0].map(schedule => schedule.user_id);
        const allUsers = await prisma.user.findMany(findObject);

        // Filter out users with non-conflicting schedules
        const usersWithoutConflicts = allUsers.filter(user => !nonConflictingUserIds.includes(user.id));

        // Create a result object if needed
        const result = generateResultJson(usersWithoutConflicts, page, size);

        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(400).send("Error checking user schedules for conflicts.");
      }
    });
