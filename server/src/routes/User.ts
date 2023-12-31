import { PrismaClient } from "@prisma/client";
import express from "express";
import { checkPassword, generateSalt, hashPassword } from "../utils/security";
import { generateFindObject, generateResultJson } from "../utils/utils";
import { SEQUENCE_KEYS, SUBSCRIPTION_STATUS } from "../utils/constants";
import { getNextSequenceValue } from "../utils/sequence";
import { ValidationError } from "../errors/validation-error";
import moment from "moment";

export const userRouter = express.Router();

const prisma = new PrismaClient();

userRouter.get("/info", async (req, res) => {
  try {
    const logged_in_user = req.headers?.["x-access-user"] as any;

    const user = await prisma.user.findFirst({
      where: {
        company_id: logged_in_user?.company_id,
        email: logged_in_user?.email,
      },
      include: {
        employment_details: true,
        preferences: true,
        department_in_charge: true,
        department: true,
      },
    });
    

    if (user) {
      user.profile_image = user.profile_image?.toString() as any;
      const { password, ...userWithoutPassword } = user;

      return res.status(200).json({
        user: userWithoutPassword,
      });
    } else {
      return res.status(400).send("Error getting user info");
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting user info");
  }
});

userRouter.get("/", async (req, res) => {
  const logged_in_user = req.headers?.["x-access-user"] as any;
  const company_id = logged_in_user["company_id"];
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id) };
    findObject.include = {
      employment_details: true,
      preferences: true,
      department_in_charge: true,
    };

    const users = await prisma.$transaction([
      prisma.user.count({ where: findObject.where }),
      prisma.user.findMany(findObject),
    ]);

    const usersWithoutPassword = users[1].map((user) => {
      const { password, ...userWithoutPassword } = user;
      userWithoutPassword.profile_image =
        (userWithoutPassword?.profile_image?.toString() as any) || null;
      return userWithoutPassword;
    });

    return res
      .status(200)
      .json(generateResultJson(usersWithoutPassword, users[0], page, size));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting users.");
  }
});

userRouter.get("/department/:department_id", async (req, res) => {
  const logged_in_user = req.headers?.["x-access-user"] as any;
  const company_id = logged_in_user["company_id"];
  const { department_id } = req.params;
  const { page, size, sort, filter } = req.query;

  try {
    const findObject = generateFindObject(page, size, sort, filter);
    findObject.where = { ...findObject.where, company_id: Number(company_id), department_id: Number(department_id) };
    findObject.include = {
      employment_details: true,
      preferences: true,
      department_in_charge: true,
    };

    const users = await prisma.$transaction([
      prisma.user.count({ where: findObject.where }),
      prisma.user.findMany(findObject),
    ]);

    const usersWithoutPassword = users[1].map((user) => {
      const { password, ...userWithoutPassword } = user;
      userWithoutPassword.profile_image =
        (userWithoutPassword?.profile_image?.toString() as any) || null;
      return userWithoutPassword;
    });

    return res
      .status(200)
      .json(generateResultJson(usersWithoutPassword, users[0], page, size));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting users.");
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
      return res
        .status(400)
        .send(
          "Error creating employee. Employee limit has been reached for your subscription."
        );
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
              working_hours: Number(
                Number(employment_details.working_hours).toFixed(2)
              ),
              employment_type: employment_details.employment_type,
            },
          },
          preferences: {
            create: [
              {
                module: "PREFERRED_WORKING_DAYS",
                preference: "",
                created_by: "SYSTEM",
                updated_by: "SYSTEM",
              },
              {
                module: "PREFERRED_WORKING_SHIFT",
                preference: "",
                created_by: "SYSTEM",
                updated_by: "SYSTEM",
              },
            ],
          },
          profile_image: profile_image ? Buffer.from(profile_image) : null,
          created_by: logged_in_user["name"],
          updated_by: logged_in_user["name"],
        },
      });
    });

    const { password: userPassword, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res
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
        profile_image: profile_image ? Buffer.from(profile_image) : null,
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
              working_hours: employment_details_without_ids.working_hours ? Number(
                employment_details_without_ids.working_hours
              ).toFixed(2) : null,
              employment_type: employment_details_without_ids.employment_type ? employment_details_without_ids.employment_type : null,
            },
          },
        },
        updated_by: logged_in_user["name"],
      },
      include: {
        employment_details: true,
        preferences: true,
        department_in_charge: true,
      }
    });

    // update preferences for user
    let prefs = [] as any[];
    for (const preference of preferences) {
      const pref = await prisma.userPreference.upsert({
        where: {
          id: preference.id,
          user_id: preference.user_id,
          user_company_id: preference.user_company_id,
        },
        create: {
          ...preference,
          user_id: user.id,
          user_company_id: user.company_id,
          created_by: logged_in_user["name"],
          updated_by: logged_in_user["name"],
        },
        update: {
          ...preference,
          updated_by: logged_in_user["name"],
        },
      });

      prefs.push(pref);
    };

    const { password: userPassword, ...userWithoutPassword } = user;
    userWithoutPassword.profile_image = userWithoutPassword.profile_image ? userWithoutPassword.profile_image.toString() as any : "";
    userWithoutPassword.preferences = prefs;

    return res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error updating employee. Please try again later.");
  }
});

userRouter.post("/change-password", async (req, res) => {
  try {
    const {
      current_password: currentPasswordB64,
      password: newPasswordB64,
      confirm_password: confirmPasswordB64,
    } = req.body;
    const logged_in_user = req.headers?.["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];
    const user_id = logged_in_user["user_id"];

    if (!currentPasswordB64 || !newPasswordB64 || !confirmPasswordB64) {
      throw new ValidationError("Missing required fields.");
    }
    if (newPasswordB64 !== confirmPasswordB64) {
      throw new ValidationError("Passwords do not match.");
    }

    // get user's password
    const user = await prisma.user.findFirst({
      where: {
        id: user_id,
        company_id: company_id,
      },
      select: {
        id: true,
        company_id: true,
        fullname: true,
        password: true,
      },
    });

    if (!user) {
      throw new ValidationError("User not found.");
    }

    // compare current password
    if (
      !checkPassword(
        Buffer.from(currentPasswordB64, "base64").toString(),
        user.password
      )
    ) {
      throw new ValidationError("Current password is incorrect.");
    }

    // update password
    await prisma.user.update({
      where: {
        id_company_id: {
          id: user_id,
          company_id: company_id,
        },
      },
      data: {
        password: hashPassword(
          Buffer.from(newPasswordB64, "base64").toString(),
          generateSalt()
        ),
      },
    });

    return res.status(200).json(generateResultJson("success"));
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      return res.status(400).send(error.message);
    } else {
      return res.status(400).send("Error changing password. Please try again later.");
    }
  }
});

userRouter.get("/check-working-hours", async (req, res) => {
  try {
    const { date } = req.query;
    const logged_in_user = req.headers?.["x-access-user"] as any;
    const company_id = logged_in_user["company_id"];
    const user_id = logged_in_user["user_id"];

    const user = await prisma.user.findFirst({
      where: {
        id: Number(user_id),
        company_id: Number(company_id),
      },
      include: { employment_details: true },
    });

    const workingHoursPerWeek = user?.employment_details?.working_hours || 0;

    // get first day of week
    const firstDayOfWeek = moment(date as string).startOf("week").toDate();
    // get last day of week
    const lastDayOfWeek = moment(date as string).endOf("week").toDate();

    // retrieve user's schedules for the week
    const schedules = await prisma.userSchedule.findMany({
      where: {
        user_id: Number(user_id),
        user_company_id: Number(company_id),
        start_date:{
          gte: firstDayOfWeek,
          lte: lastDayOfWeek,
        },
      },
      select: {
        shift: true,
      },
    });

    let currentWeekWorkingHours = 0;
    schedules.forEach((schedule) => {
      currentWeekWorkingHours += schedule.shift === "FULL" ? 8 : 4;
    });

    return res.status(200).json(generateResultJson({ workingHoursPerWeek: Number(workingHoursPerWeek), currentWeekWorkingHours: Number(currentWeekWorkingHours) }));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting user.");
  }
});

userRouter.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const logged_in_user = req.headers?.["x-access-user"] as any;
  const company_id = logged_in_user["company_id"];

  try {
    const user = (await prisma.user.findFirst({
      where: {
        id: Number(user_id),
        company_id: Number(company_id),
      },
      include: { employment_details: true, preferences: true },
    })) as any;

    const { password, ...userWithoutPassword } = user;
    userWithoutPassword.profile_image =
      (userWithoutPassword?.profile_image?.toString() as any) || null;

    return res.status(200).json(generateResultJson(userWithoutPassword));
  } catch (error) {
    console.error(error);
    return res.status(400).send("Error getting user.");
  }
});
