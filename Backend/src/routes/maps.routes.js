import { Router } from "express";
import { getCoordinates, getDistance, getNearbyLocation, savedFrequentRoute } from "../controllers/maps.controllers.js";


const router = Router();

router.route("/get-cooridinates").get(getCoordinates);
router.route("/get-Distance").get(getDistance);
router.route("/get-nearbylocation").get(getNearbyLocation);
router.route("/saved").post(savedFrequentRoute);


export default router