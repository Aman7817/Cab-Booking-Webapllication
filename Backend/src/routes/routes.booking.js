import { Router } from "express";
import { cancelRide, completeRide, createRide, getNearbyDrivers, getRideHistory } from "../controllers/ride.controllers.js";



const router = Router();


router.route('/create').post(createRide);

router.route('/cancel').post(cancelRide);

router.route("/get-history").get(getRideHistory);

router.route('/get-nearby-driver').get(getNearbyDrivers);

router.route('/complete').post(completeRide);

export default router;