import { PrismaClient } from "@prisma/client";
import express from "express";
import { generateSalt, hashPassword } from "../utils/security";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { SEQUENCE_KEYS, SUBSCRIPTION_STATUS } from "../utils/constants";
import { getNextSequenceValue } from "../utils/sequence";

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
        department_id: 1,
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
        include: { employment_details: true, preferences: true, department_in_charge: true },
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

userRouter.get("/", async (req, res) => {
  const logged_in_user = req.headers?.["x-access-user"] as any;
  const company_id = logged_in_user["company_id"];
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id) };
    findObject.include = { employment_details: true, preferences: true, department_in_charge: true };

    const users = await prisma.$transaction([
      prisma.user.count({where: findObject.where}),
      prisma.user.findMany(findObject),
    ]);

    const usersWithoutPassword = users[1].map((user) => {
      const { password, ...userWithoutPassword } = user;
      userWithoutPassword.profile_image =
        (userWithoutPassword?.profile_image?.toString() as any) || null;
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

userRouter.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const logged_in_user = req.headers?.["x-access-user"] as any;
  const company_id = logged_in_user["company_id"];
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(user_id),
        company_id: Number(company_id),
      },
      include: { employment_details: true, preferences: true },
    }) as any;

    const { password, ...userWithoutPassword } = user;
    userWithoutPassword.profile_image =
      (userWithoutPassword?.profile_image?.toString() as any) || null;
    
    res.status(200).json(generateResultJson(userWithoutPassword));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error getting user.");
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

    // check if limit has been hit
    const userCount = await prisma.user.count({
      where: {
        company_id: company_id,
      },
    });

    const subscription = await prisma.subscription.findFirst({
      where: {
        company_id: company_id,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
    });

    if (!subscription) {
      throw new Error("No active subscription found.");
    }

    if (subscription?.employee_quantity <= userCount) {
      res
        .status(400)
        .send(
          "Error creating employee. Employee limit has been reached for your subscription."
        );
      return;
    }

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
          id: await getNextSequenceValue(
            company_id,
            SEQUENCE_KEYS.USER_SEQUENCE
          ),
          company_id: company_id,
          email: email.toLocaleUpperCase().trim(),
          password: hashedPassword,
          role: role.toLocaleUpperCase().trim(),
          fullname: fullname.toLocaleUpperCase().trim(),
          contact_no: Number(contact_no),
          position: position.toLocaleUpperCase().trim(),
          status: status.toLocaleUpperCase().trim(),
          department_id: Number(department_id),
          employment_details: {
            create: {
              working_hours: Number(Number(employment_details.working_hours).toFixed(2)),
              employment_type: employment_details.employment_type,
            },
          },
          profile_image: profile_image ? Buffer.from(profile_image) : null,
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
    res
      .status(400)
      .send("Error creating new employee. Please try again later.");
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

  const { user_id, user_company_id, ...employment_details_without_ids } =
    employment_details;

    console.log(Number(employment_details_without_ids.working_hours));

  try {
    const user = await prisma.user.update({
      where: {
        id_company_id: {
          id: Number(id),
          company_id: Number(company_id),
        },
      },
      data: {
        email: email.toLocaleUpperCase().trim(),
        role: role.toLocaleUpperCase().trim(),
        fullname: fullname.toLocaleUpperCase().trim(),
        contact_no: Number(contact_no),
        position: position.toLocaleUpperCase().trim(),
        status: status,
        profile_image: profile_image,
        department_id: Number(department_id),
        employment_details: {
          upsert: {
            create: {
              working_hours: Number(
                employment_details_without_ids.working_hours
              ).toFixed(2),
              employment_type: employment_details_without_ids.employment_type,
            },
            update: {
              working_hours: Number(
                employment_details_without_ids.working_hours
              ).toFixed(2),
              employment_type: employment_details_without_ids.employment_type,
            },
          },
        },
        updated_by: logged_in_user["name"],
      },
    });

    // update preferences for user
    preferences.forEach(async (preference: any) => {
      await prisma.userPreference.upsert({
        where: {
          id: preference.id,
          user_id: preference.user_id,
          user_company_id: preference.user_company_id,
        },
        create: {
          ...preference,
          user_id: user.id,
          user_company_id: user.company_id,
        },
        update: {
          ...preference,
        },
      });
    });

    const { password: userPassword, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating employee. Please try again later.");
  }
});
