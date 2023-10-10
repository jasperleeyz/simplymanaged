import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateSalt, hashPassword } from "../utils/security";

export const userRouter = express.Router();

const prisma = new PrismaClient();

// userRouter.get("/", (req, res) => {
//   res.send("Hello World!");
// });

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
