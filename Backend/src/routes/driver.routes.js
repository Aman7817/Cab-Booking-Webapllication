import { Router } from "express";
import { getAllDrivers, getDriverCount, getDriverCountByStatus, loggedOutDriver, loginDriver, registerDriver } from "../controllers/driver.controllers.js";
import verifyjwt from"../middlewares/auth.middlewares.js"

const router = Router();

// Driver registration route
router.route("/register").post(registerDriver);

// Driver login route
router.route("/login").post(loginDriver);

// Driver logout route, secured with JWT verification middleware
router.route("/logout").post(verifyjwt, loggedOutDriver);

router.route("/getlist").get(getAllDrivers)

router.route("/count").get(getDriverCount)

router.route("/Bystatus").get(getDriverCountByStatus)

export default router;
