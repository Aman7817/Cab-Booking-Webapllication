import mongoose, { Schema } from "mongoose";
import { Driver } from "./driver.models.js"; // Driver model reference

// Define the schema for a vehicle
const vehicleSchema = new Schema(
    {
        // Reference to the Driver who owns the vehicle
        driverId: {
            type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type
            ref: "Driver", // Refers to the Driver model
            required: true, // Mandatory field
            unique: true
        },
        // Type or category of the car (e.g., Sedan, SUV, etc.)
        carOptions: {
            type: String,
            required: true, // Mandatory field
            enum: ["Sedan", "SUV", "Hatchback", "Convertible", "Truck"], // Restricts to valid options
        },
        // Color of the car
        car_color: {
            type: String,
            trim: true, // Removes leading/trailing spaces
        },
        // Model of the car
        car_model: {
            type: String,
            trim: true, // Removes leading/trailing spaces
            required: true, // Makes it mandatory
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the Vehicle model
export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
