import * as express from "express";

// import sub routers
import { userRouter } from './User';
import { registrationRouter } from './Registration';


export const routes = express.Router();

// use sub routers
routes.use('/user', userRouter);
routes.use('/registration', registrationRouter);
