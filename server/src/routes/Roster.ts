import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const RosterRouter = express.Router();

const prisma = new PrismaClient();

RosterRouter.get("/get-roster-template/:company_id/:", async (req, res) => {
  const { page, size, sort, filter } = req.query;
  const { company_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      user_company_id: Number(company_id),
    };

    const rosterTemplates = await prisma.$transaction([
      prisma.rosterTemplate.count(...findObject.where),
      prisma.rosterTemplate.findMany(findObject),
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

RosterRouter.post("/create/roster-template", async (req, res) => {
  try {
    const {
      id,
      company_id,
      name,
      no_of_employees,
      created_by,
      updated_by,
      position
    } = req.body;

    const rosterTemplate = await prisma.$transaction(async (tx) => {
      const createdTemplate = await tx.rosterTemplate.create({
        data: {
          id,
          company_id,
          name,
          no_of_employees,
          created_by,
          updated_by,
        },
      });

      // for (const positionItem of position) {
      //   await tx.rosterTemplatePosition.create({
      //     data: {
      //       roster_template_id: id,
      //       company_id: company_id,
      //       position: positionItem.position,
      //       count: positionItem.count,
      //     },
      //   });
      // }
    });
    
    res.status(200).json({
      rosterTemplate: rosterTemplate,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error creating roster template.");
  }
});
