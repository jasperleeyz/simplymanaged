import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const codeRouter = express.Router();

const prisma = new PrismaClient();

codeRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  const findObject = generateFindObject(page, size, sort, filter);

  const codes = await prisma.$transaction([
    prisma.code.count(),
    prisma.code.findMany(findObject),
  ]);

  // create result object
  const result = generateResultJson(page, size, codes);

  res.status(200).json(result);
});

codeRouter.post("/create-update", async (req, res) => {
  const code = req.body;
  const user = req.headers["x-access-user"] as any;

  // convert all to uppercase
  code.code_type = code.code_type.toUpperCase();
  code.status = code.status.toUpperCase();
  code.description = code.description.toUpperCase();
  code.code = code.code.toUpperCase();
  code.code_type_other = code.code_type_other.toUpperCase();

  try {
    if (code.code_type === "OTHER") {
      // check if new code type already exists
      const code_type = await prisma.codeType.findFirst({
        where: {
          code_type: code.code_type_other,
        },
      });

      // return error if code type already exists
      if (code_type !== null) {
        res.status(400).send("Code type already exists");
        return;
      } else {
        // create new code type
        await prisma.codeType.create({
          data: {
            code_type: code.code_type_other,
            status: "A",
            created_by: user["name"],
            updated_by: user["name"],
          },
        });
      }

      code.code_type = code.code_type_other;
    }

    let result = {};

    if (code.id === 0) {
      result = await prisma.code.create({
        data: {
          code: code.code,
          code_type: code.code_type,
          description: code.description,
          status: code.status,
          created_by: user["name"],
          updated_by: user["name"],
        },
      });
    } else {
      result = await prisma.code.update({
        where: {
          id: code.id,
        },
        data: {
          code: code.code,
          code_type: code.code_type,
          description: code.description,
          status: code.status,
          updated_by: user["name"],
        },
      });
    }

    // // insert or update code
    // const result = await prisma.code.upsert({
    //     where: {
    //         id: code.id
    //     },
    //     update: {
    //         code: code.code,
    //         code_type: code.code_type,
    //         description: code.description,
    //         status: code.status,
    //         updated_by: user["fullname"],
    //     },
    //     create: {
    //         code: code.code,
    //         code_type: code.code_type,
    //         description: code.description,
    //         status: code.status,
    //         created_by: user["fullname"],
    //         updated_by: user["fullname"],
    //     }
    // });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

codeRouter.get("/registration", async (req, res) => {
  const industry_codes = await prisma.code.findMany({
    where: {
      code_type: {
        equals: "industry",
      },
    },
  });

  const no_of_employees_codes = await prisma.code.findMany({
    where: {
      code_type: {
        equals: "no_of_employees",
      },
    },
  });

  res.status(200).json({
    industry: industry_codes,
    no_of_employees: no_of_employees_codes,
  });
});
