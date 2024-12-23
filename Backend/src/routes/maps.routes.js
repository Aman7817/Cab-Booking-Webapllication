import { Router } from "express";
import { getCoordinates } from "../controllers/maps.controllers.js";


const router = Router();

router.route("/get-cooridinates").get(getCoordinates)


export default router