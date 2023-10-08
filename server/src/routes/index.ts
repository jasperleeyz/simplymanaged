import * as express from "express";

// import sub routers
import { userRouter } from './User';
import { registrationRouter } from './Registration';
import { codeRouter } from "./Code";
import { codeTypeRouter } from "./CodeType";


export const routes = express.Router();

// use sub routers
routes.use('/user', userRouter);
routes.use('/registration', registrationRouter);
routes.use('/code', codeRouter);
routes.use('/code-type', codeTypeRouter);
