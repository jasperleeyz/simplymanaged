import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const RosterRouter = express.Router();

const prisma = new PrismaClient();

RosterRouter.get("/get-schedule/:user_company_id/:user_id", async (req, res) => {
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
      prisma.roster.count(...findObject.where),
      prisma.roster.findMany(findObject),
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

RosterRouter.get("/get-non-conflict-user/:user_company_id/:start_date/:end_date", async (req, res) => {
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
          start_date: { lte: new Date(end_date) }, // Start date is before the end date
          end_date: { gte: new Date(start_date) } // End date is after the start date
      }
      })
    ]);
    const nonConflictingUserIds = nonConflictingSchedules[0].map(schedule => schedule.user_id);
    const allUsers = await prisma.user.findMany(findObject);

    // Filter out users with non-conflicting schedules
    const usersWithoutConflicts = allUsers.filter(user => !nonConflictingUserIds.includes(user.id));

    const result = generateResultJson(usersWithoutConflicts, usersWithoutConflicts.length, page, size);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error checking user schedules for conflicts.");
  }
});

RosterRouter.post("/create/roster-template", async (req, res) => {
  try {

    const {
      id,
      company_id,
      name,
      no_of_employees,
      created_by,
      updated_by
    } = req.body;
    
    const newSchedule = await prisma.$transaction(async (tx) => {
      const createdSchedule = await tx.rosterTemplate.create({
        data: {
            id,
            company_id,
            name,
            no_of_employees,
            created_by,
            updated_by
        }
      });
      
      });
      res.status(200).json({
        rosterTemplate: ''
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error creating roster template.");
  }
});

RosterRouter.post("/create/roster-template-position", async (req, res) => {
    try {

      const {
        roster_template_id,
        company_id,
        position,
        count
      } = req.body;
      
      const newSchedule = await prisma.$transaction(async (tx) => {
        const createdSchedule = await tx.rosterTemplatePosition.create({
          data: {
            roster_template_id,
            company_id,
            position,
            count
          }
        });
        
        });
        res.status(200).json({
          rosterTemplatePosition: ''
      });
    } catch (error) {
      console.error(error);
      res.status(400).send("Error creating roster template position.");
    }
  });

RosterRouter.get("/:companyId/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const companyId = Number(req.params.companyId);

    const roster = await prisma.roster.findUnique({
      where: { id_company_id: { id: id, company_id: companyId } },
    });

    res.status(200).json(generateResultJson(roster));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving roster.");
  }
});