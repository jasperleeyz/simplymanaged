import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { SEQUENCE_KEYS, SUBSCRIPTION_STATUS } from "../utils/constants";
import { getNextSequenceValue } from "../utils/sequence";
import { create } from "domain";

export const RosterRouter = express.Router();

const prisma = new PrismaClient();

RosterRouter.get("/get-roster-template/:company_id", async (req, res) => {
  const { page, size, sort, filter } = req.query;
  const { company_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      company_id: Number(company_id),
    };

    const rosterTemplates = await prisma.$transaction([
      prisma.rosterTemplate.count({ where: findObject.where }),
      prisma.rosterTemplate.findMany({
        ...findObject,
        where: {
          company_id: Number(company_id),
        },
        include: {
          positions: true,
        },
      }),
    ]);

    // create result object
    const result = generateResultJson(
      rosterTemplates[1],
      rosterTemplates[0],
      page,
      size
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving roster templates.");
  }
});

RosterRouter.get("/get-roster-template-positions/:company_id/:roster_template_id", async (req, res) => {
  const { page, size, sort, filter } = req.query;
  const { company_id, roster_template_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      company_id: Number(company_id),
      roster_template_id: Number(roster_template_id)
    };

    const rosterTemplatePosition = await prisma.$transaction([
      prisma.rosterTemplatePosition.count({where: findObject.where}),
      prisma.rosterTemplatePosition.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(
      rosterTemplatePosition[1],
      rosterTemplatePosition[0],
      page,
      size
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving roster template position.");
  }
});

RosterRouter.post("/create/roster-template", async (req, res) => {
  try {
    const {
      company_id,
      name,
      roster_type,
      no_of_employees,
      created_by,
      updated_by,
      positions
    } = req.body;

    const id = await getNextSequenceValue(
      company_id,
      SEQUENCE_KEYS.USER_SEQUENCE
    )
    
    const rosterTemplate = await prisma.$transaction(async (tx) => {
      const createdTemplate = await tx.rosterTemplate.create({
        data: {
          id: id,
          company_id: company_id,
          roster_type: roster_type,
          name: name,
          no_of_employees: no_of_employees,
          created_by: created_by,
          updated_by: updated_by,
          updated_date: new Date()
        },
      });
      for (const positionItem of positions) {
        await tx.rosterTemplatePosition.create({
          data: {
            roster_template_id: id,
            company_id: company_id,
            position: positionItem.position,
            count: positionItem.count,
          },
        });
      }
    });
    res.status(200).json({
      rosterTemplate: rosterTemplate,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error creating roster template.");
  }
});

RosterRouter.post("/create/roster", async (req, res) => {
  try {
    const {
      company_id,
      location_id,
      department_id,
      start_date,
      end_date,
      type,
      created_by,
      updated_by,
      schedules,
      positions
    } = req.body;

    const id = await getNextSequenceValue(
      company_id,
      SEQUENCE_KEYS.USER_SEQUENCE
    )
    
    const roster = await prisma.$transaction(async (tx) => {
      const created = await tx.roster.create({
        data: {
          id: id,
          company_id: company_id,
          location_id: location_id,
          department_id: department_id,
          start_date: start_date,
          end_date: end_date,
          type: type,
          created_by: created_by,
          updated_by: updated_by,
          updated_date: new Date()
        },
      });
      for (const schedule of schedules) {
        await tx.userSchedule.create({
          data: {
            user_id: schedule.user_id,
            user_company_id: schedule.user_company_id,
            roster_id: id,
            start_date: schedule.start_date,
            end_date: schedule.end_date,
            shift: schedule.shift,
            status: schedule.status,
            created_by: schedule.created_by,
            updated_by: schedule.updated_by,
            updated_date: new Date()
          },
        });
      };
      for (const position of positions) {
        await tx.rosterPosition.create({
          data: {
            roster_id: id,
            company_id: position.company_id,
            position: position.position,
            count: position.count,
          },
        });
      };
    });
    res.status(200).json({
      roster: roster,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error creating roster");
  }
});

RosterRouter.delete("/delete/roster-template", async (req, res) => {
  try {
    const { id, company_id } = req.body;

    const rosterTemplate = await prisma.$transaction(async (tx) => {
      await tx.rosterTemplatePosition.deleteMany({
        where: {
          roster_template_id: id,
        }
      });

      await tx.rosterTemplate.delete({
        where: {
          id_company_id: {
            id,
            company_id,
          },
        },
      });


    });

    res.status(200).json({
      message: 'Roster template deleted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting roster template.");
  }
});

RosterRouter.get("/get-roster-from-to/:company_id", async (req, res) => {
  try {
    const { company_id} = req.params;
    const { from, to } = req.query;

    const roster = await prisma.roster.findMany({
      where: {
        company_id: Number(company_id),
        start_date: {
          gte: from as string,
          lte: to as string,
        },
      },
      include: {
        schedules: {
          include: {
            user: true
          }
        },
      positions: true
        //location: true
      },
    });

    res.status(200).json(generateResultJson(roster));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving roster.");
  }
});

RosterRouter.delete("/delete/roster", async (req, res) => {
  try {
    const { id, company_id } = req.body;

    const rosterTemplate = await prisma.$transaction(async (tx) => {
      await tx.userSchedule.deleteMany({
        where: {
          roster_id: id,
        }
      });

      await tx.roster.delete({
        where: {
          id_company_id: {
            id,
            company_id,
          },
        },
      });


    });

    res.status(200).json({
      message: 'Roster deleted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting roster template.");
  }
});

RosterRouter.post("/update/roster", async (req, res) => {
  const user = req.headers["x-access-user"] as any;
  try {
    const {
      id,
      company_id,
      type,
      schedules
    } = req.body;


    const roster = await prisma.$transaction(async (tx) => {
      const updatedRoster = await tx.roster.update({
        where: {
          id_company_id: {
            company_id,
            id : id
          },
        },
        data: {
          type,
          updated_by: user["name"]
        },
      });
      await tx.userSchedule.deleteMany({
        where: {
          roster_id: id,
        }
      });
      for (const scheduleItem of schedules) {
        await tx.userSchedule.create({
          data: {
            user_id: scheduleItem.user_id,
            user_company_id: scheduleItem.user_company_id,
            roster_id: id,
            start_date: scheduleItem.start_date,
            end_date: scheduleItem.end_date,
            shift: scheduleItem.shift,
            status: scheduleItem.status,
            created_by: scheduleItem.created_by,
            created_date: scheduleItem.created_date,
            updated_by: user["name"],
            updated_date: new Date()
          },
        });
      }
    });
    res.status(200).json({
      roster: roster,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating Roster.");
  }
});