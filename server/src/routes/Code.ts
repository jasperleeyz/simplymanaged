import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const codeRouter = express.Router();

const prisma = new PrismaClient();

codeRouter.get("/", async (req, res) => {
  const { page, size, sort, filter, cursor } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);

    const codes = await prisma.$transaction([
      prisma.code.count(...findObject.where),
      prisma.code.findMany(findObject),
    ]);

    // create result object
    const result = generateResultJson(codes[1], codes[0], page, size);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving codes.");
  }
});

codeRouter.get("/registration", async (req, res) => {
  try {
    const industry_codes = await prisma.code.findMany({
      where: {
        code_type: {
          equals: "industry",
        },
        status: {
          equals: "A",
        },
      },
      orderBy: {
        description: "asc",
      }
    });

    const no_of_employees_codes = await prisma.code.findMany({
      where: {
        code_type: {
          equals: "no_of_employees",
        },
        status: {
          equals: "A",
        },
      },
    });

    // convert code value to number and sort no_of_employees_codes by code
    const updated_no_of_employees_codes = no_of_employees_codes.map((code) => {
      const newCode = {...code, code: parseInt(code.code)};
      return newCode;
    }).sort((a, b) => a.code - b.code);

    res.status(200).json(
      generateResultJson({
        industry: industry_codes,
        no_of_employees: updated_no_of_employees_codes,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving codes.");
  }
});

codeRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const code = await prisma.code.findFirst({
      where: {
        id: id,
      },
    });

    if (code === null) {
      res.status(400).send("Code not found.");
    } else {
      res.status(200).json(generateResultJson(code));
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("Error retrieving code.");
  }
});

codeRouter.post("/create-update", async (req, res) => {
  const code = req.body;
  const user = req.headers["x-access-user"] as any;

  // convert all to uppercase
  code.code_type = code.code_type.toUpperCase();
  code.status = code.status.toUpperCase();
  code.description = code.description.toUpperCase();
  code.code = code.code.toUpperCase();

  try {
    if (code.code_type === "OTHER") {
      // check if new code type already exists
      const code_type = await prisma.codeType.findFirst({
        where: {
          code_type: code.code_type_other,
        },
      });

      code.code_type_other = code.code_type_other.toUpperCase();

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
          updated_date: new Date(),
        },
      });
    }

    res.status(200).json(generateResultJson(result));
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});


