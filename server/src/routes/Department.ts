import { Department, PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { getNextSequenceValue } from "../utils/sequence";
import { SEQUENCE_KEYS } from "../utils/constants";

export const departmentRouter = express.Router();

const prisma = new PrismaClient();

departmentRouter.get("/:company_id", async (req, res) => {
  const { company_id } = req.params;
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id) };
    findObject.include = {
      employees: {
        select: {
          id: true,
          company_id: true,
          fullname: true,
          profile_image: true,
          email: true,
          contact_no: true,
          position: true,
          department_id: true,
          role: true,
          status: true,
        },
      },
      department_head: {
        select: {
          id: true,
          company_id: true,
          fullname: true,
          profile_image: true,
          email: true,
          contact_no: true,
          position: true,
          department_id: true,
          role: true,
          status: true,
        },
      },
    };

    const departments = await prisma.$transaction([
      prisma.department.count({ where: findObject.where }),
      prisma.department.findMany(findObject),
    ]);

    // departments[1].forEach((department: Department) => {

    // }

    res
      .status(200)
      .json(generateResultJson(departments[1], departments[0], page, size));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting departments.");
  }
});

departmentRouter.post("/create-update", async (req, res) => {
  const { id, company_id, department_name, department_head_id } = req.body;
  const logged_in_user = req.headers?.["x-access-user"] as any;

  try {
    let department;

    if (id) {
      department = await prisma.department.update({
        where: {
          company_id_id: {
            company_id: company_id,
            id: id,
          },
        },
        data: {
          department_name: department_name.toLocaleUpperCase().trim(),
          department_head_id:
            Number(department_head_id) === 0
              ? null
              : Number(department_head_id),
          updated_by: logged_in_user?.name,
          // updated_date: new Date(),
        },
      });

      // change selected head of department to new department
      if (Number(department_head_id) !== 0) {
        await prisma.user.update({
          where: {
            id_company_id: {
              company_id: Number(company_id),
              id: Number(department_head_id),
            },
          },
          data: {
            department_id: Number(id),
          },
        });
      }
    } else {
      department = await prisma.$transaction(async (tx) => {
        return await tx.department.create({
          data: {
            id: await getNextSequenceValue(
              company_id,
              SEQUENCE_KEYS.DEPARTMENT_SEQUENCE
            ),
            company_id: company_id,
            department_name: department_name.toLocaleUpperCase().trim(),
            department_head_id:
              Number(department_head_id) === 0 ? null : Number(department_head_id),
            created_by: logged_in_user["name"],
            updated_by: logged_in_user["name"],
          },
        });
      });

      // change selected head of department to new department
      await prisma.user.update({
        where: {
          id_company_id: {
            company_id: Number(company_id),
            id: Number(department_head_id),
          },
        },
        data: {
          department_id: Number(department.id),
        },
      });
    }

    res.status(200).json(generateResultJson(department));
  } catch (error) {
    console.error(error);
    res.status(400).send(`Error ${id ? "updating" : "adding"} department.`);
  }
});

departmentRouter.get("/:departmentId/head-of-department", async (req, res) => {
  try {
    const department_id = req.params?.departmentId;

    const logged_in_user = req.headers["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];

    const department = (await prisma.department.findFirst({
      where: {
        id: Number(department_id),
        company_id: Number(company_id),
      },
      include: {
        department_head: {
          select: {
            fullname: true,
            profile_image: true,
            email: true,
            contact_no: true,
            position: true,
          },
        },
      },
    })) as any;

    return res.status(200).json(generateResultJson(department.department_head));
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error getting head of department");
  }
});
