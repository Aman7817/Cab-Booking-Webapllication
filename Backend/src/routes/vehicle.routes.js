import { Router } from "express";
import { createVehicle, deleteVehicle, getAllVehicles, getVehicleById, updateVehicleDetails,assignVehicleToDriver } from "../controllers/vehicle.controlers.js";

const router = Router();

// vehicle ko add kerne ka route
router.route("/create").post(createVehicle)
// vehicles ke ke list ka route
router.route("/getlist").get(getAllVehicles)
// vehicle find by id
router.route("/:id").get(getVehicleById)

// router for update vehivle's details 
router.route("/update/:id").put(updateVehicleDetails)
// delete vehicle
router.route("/delete/:id").delete(deleteVehicle)

router.route("/assign").post(assignVehicleToDriver);


export default router