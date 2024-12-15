import express from "express";
import { updateDriverLocation, updateUserLocation, getDriverLocation, getUserLocation } from "../controllers/location.controller.js";

const router = express.Router();

// Route to update driver location
router.put("/driver/update", updateDriverLocation);

// Route to update user location
router.put("/user/update", updateUserLocation);

// Route to get driver location
router.get("/driver/:driverId", getDriverLocation);

// Route to get user location
router.get("/user/:userId", getUserLocation);

export default router;
