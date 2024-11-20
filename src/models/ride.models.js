import mongoose, { Schema } from "mongoose";
import { User } from "./user.models.js"; // User model
import { Driver } from "./driver.models.js"; // Driver model
import { Vehicle } from "./vehicle.models.js"; // Corrected Vehicle model

// Define the schema for a ride
const rideSchema = new Schema(
    {
        // Reference to the User who requested the ride
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // Index for optimization
        },
        // Reference to the Driver assigned for the ride
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
            index: true, // Index for optimization
        },
        // Reference to the Vehicle used for the ride
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },
        // Starting point of the ride
        source: {
            type: String,
            required: true,
            trim: true, // Removes extra spaces
        },
        // Destination point of the ride
        destination: {
            type: String,
            required: true,
            trim: true, // Removes extra spaces
        },
        // Price for the ride
        Price: {
            type: Number,
            required: true,
            min: 0, // Ensures fare is non-negative
        },
        // Currency of the fare
        currency: {
            type: String,
            enum: ["INR", "USD", "EUR"], // Restricts to allowed currencies
            default: "INR", // Default currency
        },
        // Current status of the ride
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"], // Allowed values
            default: "pending", // Default value
        },
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    },
);

// Create and export the Ride model
export const Ride = mongoose.model("Ride", rideSchema);
