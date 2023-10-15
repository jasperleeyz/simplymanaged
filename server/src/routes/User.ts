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
      user.profile_image = user.profile_image?.toString() as string;
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
    findObject.include = { employment_details: true, preferences: true };

    const users = await prisma.$transaction([
      prisma.user.count(...findObject.where),
      prisma.user.findMany(findObject),
    ]);

    const usersWithoutPassword = users[1].map((user) => {
      const { password, ...userWithoutPassword } = user;
      userWithoutPassword.profile_image = userWithoutPassword?.profile_image?.toString() as any || null;
      return userWithoutPassword;
    });

    res
      .status(200)
      .json(generateResultJson(usersWithoutPassword, users[0], page, size));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting users.");
  }
});

userRouter.post("/create", async (req, res) => {
  try {
    const logged_in_user = req.headers?.["x-access-user"] as any;

    // generate password
    const password = "password"; // TODO: to replace with random password generator
    const hashedPassword = hashPassword(password, generateSalt());

    const {
      email,
      fullname,
      contact_no,
      position,
      role,
      status,
      department_id,
      employment_details,
      profile_image,
      company_id,
    } = req.body;

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          company_id: company_id,
        },
        orderBy: {
          id: "desc",
        },
        select: { id: true },
      });

      return await tx.user.create({
        data: {
          id: existingUser ? existingUser.id + 1 : 1,
          company_id: company_id,
          email: email,
          password: hashedPassword,
          role: role,
          fullname: fullname,
          contact_no: Number(contact_no),
          position: position,
          status: status,
          employment_details: {
            connectOrCreate: {
              where: {
                user_id_user_company_id: {
                  user_id: existingUser ? existingUser.id + 1 : 1,
                  user_company_id: company_id,
                },
                employment_type: employment_details.employment_type,
                working_hours: Number(employment_details.working_hours),
              },
              create: {
                working_hours: Number(employment_details.working_hours),
                employment_type: employment_details.employment_type,
              },
            },
          },
          profile_image: Buffer.from(profile_image),
          created_by: logged_in_user["name"],
          updated_by: logged_in_user["name"],
        },
      });
    });

    const { password: userPassword, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error creating user.");
  }
});

userRouter.post("/update", async (req, res) => {
  const {
    id,
    company_id,
    email,
    fullname,
    contact_no,
    position,
    department_id,
    role,
    status,
    employment_details,
    preferences,
    profile_image,
  } = req.body;

  const logged_in_user = req.headers?.["x-access-user"] as any;

  try {
    const user = await prisma.user.update({
      where: {
        id: id,
        id_company_id: company_id,
      },
      data: {
        email: email,
        role: role,
        fullname: fullname,
        contact_no: Number(contact_no),
        position: position,
        status: status,
        profile_image: profile_image,
        department: {
          connect: {
            id: department_id,
            company_id_id: company_id,
          }
        },
        employment_details: employment_details,
        preferences: preferences,
        updated_by: logged_in_user["name"],
      },
    });

    const { password: userPassword, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating user.");
  }
});
