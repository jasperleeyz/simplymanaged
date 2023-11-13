import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { getNextSequenceValue } from "../utils/sequence";
import { SEQUENCE_KEYS } from "../utils/constants";

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

    const companyCodes = (await prisma.$transaction([
      prisma.companyCode.count({ where: findObject.where }),
      prisma.companyCode.findMany(findObject),
    ])) as [number, any[]];

    for (let companyCode of companyCodes[1]) {
      if (companyCode.code_type === "LEAVE_TYPE") {
        const leave_details = await prisma.companyLeaveBalance.findFirst({
          where: {
            company_id: Number(company_id),
            leave_type: companyCode.code,
          },
        });

        companyCode.leave_balance = leave_details?.balance || 0;
        companyCode.require_doc = leave_details?.require_doc === "Y" ? true : false;
        companyCode.auto_approve = leave_details?.auto_approve === "Y" ? true : false;
        companyCode.has_half_day = leave_details?.has_half_day === "Y" ? true : false;
      }
    }

    // create result object
    const result = generateResultJson(
      companyCodes[1],
      companyCodes[0],
      page,
      size
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error retrieving company codes.");
  }
});

companyCodeRouter.post("/create-update", async (req, res) => {
  let {
    id,
    company_id,
    code_type,
    code,
    description,
    status,
    code_type_other,
    leave_balance,
    require_doc,
    auto_approve,
    has_half_day,
  } = req.body;
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
        return res.status(400).send("Code type already exists");
      } else {
        // create new code type
        await prisma.$transaction(async (tx) => {
          return await tx.companyCodeType.create({
            data: {
              id: await getNextSequenceValue(
                company_id,
                SEQUENCE_KEYS.COMPANY_CODE_TYPE_SEQUENCE
              ),
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
      companyCode = await prisma.$transaction(async (tx) => {

        const updated_company_code = await tx.companyCode.update({
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

        if (code_type === "LEAVE_TYPE") {
          await tx.companyLeaveBalance.upsert({
            where: {
              company_id_leave_type: {
                company_id: company_id,
                leave_type: code,
              },
            },
            create: {
              company_id: company_id,
              balance: Number(leave_balance),
              leave_type: code,
              require_doc: require_doc ? "Y" : "N",
              auto_approve: auto_approve ? "Y" : "N",
              has_half_day: has_half_day ? "Y" : "N",
              created_by: logged_in_user?.name,
              updated_by: logged_in_user?.name,
            },
            update: {
              balance: Number(leave_balance),
              require_doc: require_doc ? "Y" : "N",
              auto_approve: auto_approve ? "Y" : "N",
              has_half_day: has_half_day ? "Y" : "N",
              updated_by: logged_in_user?.name,
            },
          });
        }

        return updated_company_code;
      });
    } else {
      companyCode = await prisma.$transaction(async (tx) => {
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
            id: await getNextSequenceValue(
              company_id,
              SEQUENCE_KEYS.COMPANY_CODE_SEQUENCE
            ),
          },
        });
      });

      if (code_type === "LEAVE_TYPE") {
        await prisma.companyLeaveBalance.create({
          data: {
            company_id: company_id,
            leave_type: code,
            balance: Number(leave_balance),
            require_doc: require_doc ? "Y" : "N",
            auto_approve: auto_approve ? "Y" : "N",
            has_half_day: has_half_day ? "Y" : "N",
            created_by: logged_in_user?.name,
            updated_by: logged_in_user?.name,
          },
        });
      }
    }

    return res.status(200).json(generateResultJson(companyCode));
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .send(`Error ${id ? "updating" : "creating"} company code.`);
  }
});
