import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const locationRouter = express.Router();

const prisma = new PrismaClient();

locationRouter.get("/:company_id", async (req, res) => {
  const { company_id } = req.params;
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id) };

    const locations = await prisma.$transaction([
      prisma.companyLocation.count(...findObject.where),
      prisma.companyLocation.findMany(findObject),
    ]);

    res
      .status(200)
      .json(generateResultJson(locations[1], locations[0], page, size));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting locations.");
  }
});

locationRouter.post("/create-update", async (req, res) => {
    const { id, company_id, name, address } = req.body;
    const logged_in_user = req.headers?.["x-access-user"] as any;
  
    try {
      let loc;
  
      if (id) {
        loc = await prisma.companyLocation.update({
          where: {
            id_company_id: {
              company_id: company_id,
              id: id,
            },
          },
          data: {
            name: name.toLocaleUpperCase().trim(),
            address: address.toLocaleUpperCase().trim(),
            updated_by: logged_in_user?.name,
            // updated_date: new Date(),
          },
        });
      } else {
        loc = prisma.$transaction(async (tx) => {
          const existingLoc = await tx.companyLocation.findFirst({
            where: {
              company_id: company_id,
            },
            orderBy: {
              id: "desc",
            },
            select: { id: true },
          });
  
          return await tx.companyLocation.create({
            data: {
              id: existingLoc ? existingLoc.id + 1 : 1,
              company_id: company_id,
              name: name.toLocaleUpperCase().trim(),
              address: address.toLocaleUpperCase().trim(),
              created_by: logged_in_user["name"],
              updated_by: logged_in_user["name"],
            },
          });
        });
      }
  
      res.status(200).json(generateResultJson(loc));
    } catch (error) {
      console.error(error);
      res.status(400).send(`Error ${id ? "updating": "adding"} location.`);
    }
  });