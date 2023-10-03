import { PrismaClient } from '@prisma/client';
import express from 'express'


export const userRouter = express.Router();

const prisma = new PrismaClient()

userRouter.get('/', (req, res) => {
    res.send('Hello World!');
});