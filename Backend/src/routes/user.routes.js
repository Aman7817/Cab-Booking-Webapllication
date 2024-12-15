import {Router} from "express"

import { loginUser, logOutUser, registerUser } from "../controllers/user.controllers.js";
import  verifyjwt  from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post( registerUser)

router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post( verifyjwt,logOutUser)

export default router