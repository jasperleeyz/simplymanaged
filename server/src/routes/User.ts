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
      role: "S",
      fullname: "Gojo Satoru",
    };

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
  }
});