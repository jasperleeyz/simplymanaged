import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { getNextSequenceValue } from "../utils/sequence";
import { SEQUENCE_KEYS } from "../utils/constants";

export const locationRouter = express.Router();

const prisma = new PrismaClient();

locationRouter.get("/:company_id", async (req, res) => {
  const { company_id } = req.params;
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id) };

    const locations = await prisma.$transaction([
      prisma.companyLocation.count({where: findObject.where}),
      prisma.companyLocation.findMany(findObject),
    ]);

    return res
      .status(200)
      .json(generateResultJson(locations[1], locations[0], page, size));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting locations.");
  }
});

locationRouter.get("/:company_id/:location_id", async (req, res) => {
  const { company_id, location_id } = req.params;

  try {
    const location = await prisma.companyLocation.findUnique({
      where: {
        id_company_id: {
          id: Number(location_id),
          company_id: Number(company_id),
        },
      },
    });
    
    return res
      .status(200)
      .json(generateResultJson(location));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting location.");
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
          return await tx.companyLocation.create({
            data: {
              id: await getNextSequenceValue(company_id, SEQUENCE_KEYS.COMPANY_LOCATION_SEQUENCE),
              company_id: company_id,
              name: name.toLocaleUpperCase().trim(),
              address: address.toLocaleUpperCase().trim(),
              created_by: logged_in_user["name"],
              updated_by: logged_in_user["name"],
            },
          });
        });
      }
  
      return res.status(200).json(generateResultJson(loc));
    } catch (error) {
      console.error(error);
      return res.status(400).send(`Error ${id ? "updating": "adding"} location.`);
    }
  });