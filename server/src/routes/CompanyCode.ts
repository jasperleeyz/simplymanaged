import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const companyCodeRouter = express.Router();

const prisma = new PrismaClient();

companyCodeRouter.get("/:company_id", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;
  const { company_id } = req.params;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = {
      ...findObject.where,
      company_id: Number(company_id),
    };

    const companyCodes = await prisma.$transaction([
      prisma.companyCode.count(...findObject.where),
      prisma.companyCode.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(
      companyCodes[1],
      companyCodes[0],
      page,
      size
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving company codes.");
  }
});

companyCodeRouter.post("/create-update", async (req, res) => {
  let { id, company_id, code_type, code, description, status, code_type_other } = req.body;
  const logged_in_user = req.headers?.["x-access-user"] as any;

  try {
    if (code_type === "OTHER") {
      // check if new code type already exists
      const existing_code_type = await prisma.companyCodeType.findFirst({
        where: {
          company_id: company_id,
          code_type: code_type_other,
        },
      });

      // return error if code type already exists
      if (existing_code_type !== null) {
        res.status(400).send("Code type already exists");
        return;
      } else {
        // create new code type
        await prisma.$transaction(async (tx) => {
          const existingCompanyCodeType = await tx.companyCodeType.findFirst({
            where: {
              company_id: company_id,
            },
            orderBy: {
              id: "desc",
            },
            select: { id: true },
          });
  
          return await tx.companyCodeType.create({
            data: {
              id: existingCompanyCodeType ? existingCompanyCodeType.id + 1 : 1,
              company_id: company_id,
              code_type: code_type_other.toLocaleUpperCase().trim(),
              status: "A",
              created_by: logged_in_user["name"],
              updated_by: logged_in_user["name"],
            },
          });
        });
      }

      code_type = code_type_other.toLocaleUpperCase().trim();
    }
  
    let companyCode;

    if (id) {
      companyCode = await prisma.companyCode.update({
        where: {
          company_id_id: {
            company_id: company_id,
            id: id,
          },
        },
        data: {
          code_type: code_type,
          code: code.toLocaleUpperCase().trim(),
          description: description.toLocaleUpperCase().trim(),
          status: status,
          updated_by: logged_in_user?.name,
          // updated_date: new Date(),
        },
      });
    } else {
      companyCode = prisma.$transaction(async (tx) => {
        const existingCompanyCode = await tx.companyCode.findFirst({
          where: {
            company_id: company_id,
          },
          orderBy: {
            id: "desc",
          },
          select: { id: true },
        });

        return await tx.companyCode.create({
          data: {
            code_type: code_type,
            code: code.toLocaleUpperCase().trim(),
            description: description.toLocaleUpperCase().trim(),
            status: status,
            created_by: logged_in_user?.name,
            updated_by: logged_in_user?.name,
            // created_date: new Date(),
            company_id: company_id,
            id: existingCompanyCode ? existingCompanyCode.id + 1 : 1,
          },
        });
      });
    }

    res.status(200).json(generateResultJson(companyCode));
  } catch (error) {
    console.error(error);
    res.status(400).send(`Error ${id ? "updating": "creating"} company code.`);
  }
});
