import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateSalt, hashPassword } from "../utils/security";
import { generateFindObject, generateResultJson } from "../utils/utils";

export const userRouter = express.Router();

const prisma = new PrismaClient();


userRouter.get("/info", async (req, res) => {
  try {
    const logged_in_user = req.headers?.["x-access-user"] as any;

    // TODO: to remove after testing
    const getRole = (email: string) => {
      if (email === "superadmin@email.com") return "SA";
      else if (email === "systemadmin@email.com") return "A";
      else if (email === "manager@email.com") return "M";
      else return "E";
    };
    // TODO: to remove if else after testing
    let user = undefined as any;
    if (
      [
        "superadmin@email.com",
        "systemadmin@email.com",
        "manager@email.com",
        "employee@email.com",
      ].includes(logged_in_user?.email)
    ) {
      user = {
        email: logged_in_user?.email,
        password: hashPassword("password", generateSalt()),
        role: getRole(logged_in_user?.email),
        fullname: "Gojo Satoru",
        id: 0,
        company_id: 0,
        contact_no: "99999999",
        position: "STORE MANAGER",
        status: "A",
        employment_details: {
          user_id: 0,
          user_company_id: 0,
          working_hours: 8,
          employment_type: "FULL-TIME",
        },
        profile_image:
          "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
        preferences: [],
      };
    } else {
      user = await prisma.user.findFirst({
        where: {
          company_id: logged_in_user?.company_id,
          email: logged_in_user?.email,
        },
      });
    }

    if (user) {
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        user: userWithoutPassword,
      });
    } else {
      res.status(400).send("Error getting user info");
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting user info");
  }
});

userRouter.get("/:company_id", async (req, res) => {
  const { company_id } = req.params;
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id) };

    const users = await prisma.$transaction([
      prisma.user.count(...findObject.where),
      prisma.user.findMany(findObject),
    ]);

    const usersWithoutPassword = users[1].map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json(generateResultJson(usersWithoutPassword, users[0], page, size));
  } catch (error) {
    res.status(400).send("Error getting users.");
  }
});