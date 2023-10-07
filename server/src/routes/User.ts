import { PrismaClient } from '@prisma/client';
import express from 'express'


export const userRouter = express.Router();

const prisma = new PrismaClient()

userRouter.get("/", (req, res) => {
  res.send("Hello World!");
});

userRouter.get("/info", (req, res) => {
  try {
    // const user = await prisma.user.findUnique({
    //   where: {
    //     email: email,
    //   },
    // });

    const user = {
      email: "abcdef@email.com",
      password: "",
      role: "SA",
      fullname: "Gojo Satoru",
      id: 0,
      companyId: 0,
      contactNo: "99999999",
      position: "STORE MANAGER",
      status: "A",
      employmentDetails: {
        userId: 0,
        userCompanyId: 0,
        workingHours: 8,
        employmentType: "FULL-TIME"
      },
      profileImage:
        "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
      preferences: [],
    };

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
  }
});