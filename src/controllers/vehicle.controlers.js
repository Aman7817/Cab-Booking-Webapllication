import mongoose, {schema} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vehicle } from "../models/vehicle.models.js";
import { Driver } from "../models/driver.models.js";
import { sendEmail } from "../utils/mailService.js";


//A controller to create and save a new vehicle.
const createVehicle = asyncHandler(async(req,res) => {
    const {driverId,carOptions,car_color,car_model,licensePlate} = req.body;

    if(!driverId || !carOptions || !car_color || !car_model || !licensePlate){
        throw new ApiError(400,"driverId,carOptions,car_color,car_model and licensePlate are required")
    }
try {
        
        // check if a vehicle already exist for the driver
    
        const vehicleExists = await Vehicle.findOne({licensePlate});
        if(vehicleExists){
            return res.status(409).json(
                new ApiResponse(409,vehicleExists,"vehicle with this license plate already exists ")
            );
        }
    
        // create the new vehicle 
    
        const newVechicle = await Vehicle.create({
            driverId,
            car_color,
            car_model,
            carOptions,
            licensePlate,
        });
        // const newVechicleSave = await newVechicle.save(); // jarurat nhi hai kyuoki create method use kiya hai

        return res.status(201).json(
            new ApiResponse(201,newVechicle,"vehicle added succssfully")
        )
} catch (error) {
    throw new ApiError(500,error.message || "Failed to create the vehicle")
}

});

const getAllVehicles = asyncHandler(async(req,res) => {
    try {
        const vehicles = await Vehicle.find().populate("driverId","name email");
        if(!vehicles.lenght) {
            throw new ApiError(404,"No vehicles found");
        }
        // send response with vehicles

        return res.status(200).json(
            new ApiResponse(200,vehicles,"Vehicles retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(500,error.message || "Failed to retrieve vehicles")
    }

});

const getVehicleById = asyncHandler(async(req,res)=> {
    const {id} = req.params; // Fetch the ID from the URL parameter

    if(!id) {
        throw new ApiError(400,"vehicle ID is required");
    }

    try {
        
        const vehicle = await Vehicle.findById(id).populate("driverId","name email");

        if(!vehicle){
            throw new ApiError(404,"Vehicle not found");
        }

        // return the vehicle details
        return res.status(200).json(
            new ApiResponse(200,vehicle,"Vehicle retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to retrieve the vehicle")
    }
});

const updateVehicleDetails = asyncHandler(async(req,res) => {
    const {id} = req.params;
    const {carOptions,car_model,car_color,licensePlate} = req.body;

    if(!carOptions || !car_model || !car_color || !licensePlate){
        throw new ApiError(400,"carOptions, car_color, car_model, and licensePlate are required")
    }

    try {
        // find the vehicles by its id

        const vehicle = await Vehicle.findById(id);

        // If the vehicle does not exist, throw a 404 error
        
        if(!vehicle) {
            throw new ApiError(404,"Vehicle not found")
        }
        // update vehicles details

        vehicle.carOptions = carOptions;
        vehicle.car_model = car_model;
        vehicle.car_color = car_color;

        // save the update vehicle
        const updatedVehicle = await vehicle.save();
         // Return the updated vehicle in the response
         return res.status(200).json(
            new ApiResponse(200, updatedVehicle, "Vehicle updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to update the vehicle");
 
    }
});

const deleteVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get vehicle ID from the URL parameter

    try {
        // Find the vehicle by its ID
        const vehicle = await Vehicle.findById(id);

        // If the vehicle doesn't exist, throw a 404 error
        if (!vehicle) {
            throw new ApiError(404, "Vehicle not found");
        }

        // Delete the vehicle
        await vehicle.remove();

        // Return a success response after deleting the vehicle
        return res.status(200).json(
            new ApiResponse(200, null, "Vehicle deleted successfully")
        );
    } catch (error) {
        // Catch any error and send a 500 response
        throw new ApiError(500, error.message || "Failed to delete the vehicle");
    }
});
const assignVehicleToDriver = asyncHandler(async(req,res) => {
    const {driverId,vehicleId} = req.body;
    if(!driverId || !vehicleId){
        throw new ApiError(400, "driverId and vehicleId are required");
    }

    try {
        // find by the vehicle by ID
        const vehicle = await Vehicle.findById(vehicleId);
        if(!vehicle) {
            throw new ApiError(404,"Vehicle not found");
        }
        // find the drievr by id 
        const driver = await Driver.findById(driverId);
        if(!driver){
            throw new ApiError(404,"driver not found ");
        }
        //// Check if the driver is already assigned a vehicle (optional)
        if (vehicle.driverId) {
            throw new ApiError(400, "This vehicle is already assigned to another driver");
        }
        // assign the vehicle to the driver
        vehicle.driverId = driverId;

        // save the updated vehcile 
        const update = await vehcile.save();

        return res.status(200).json(
            new ApiResponse(200, updatedVehicle, "Vehicle assigned to driver successfully")
        );
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Failed to assign vehicle to driver");
        
    }
})
export {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicleDetails,
    deleteVehicle,
    assignVehicleToDriver
}