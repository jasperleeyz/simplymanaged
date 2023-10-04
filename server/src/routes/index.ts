import * as express from "express";

// import sub routers
import { userRouter } from "./User";

export const routes = express.Router();

// use sub routers
routes.use("/user", userRouter);
