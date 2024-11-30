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
            index: true, // Index for optimization
        },
        // Reference to the Vehicle used for the ride
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
        },
        // Starting point of the ride
        source: {
            type: { type: String, enum: ["Point"], required: true },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        // Destination point of the ride
        destination: {
            type: { type: String, enum: ["Point"], required: true },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        distance: { // Distance in kilometers
            type: Number,
            required: true,
            min: 0,
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
            enum: ["pending", "scheduled", "completed", "cancelled"], // Added "scheduled"
            default: "pending", // Default value
        },
        // Scheduled time for future booking
        scheduledTime: {
            type: Date, // Time for the future booking
        },
        // Actual start time of the ride
        startTime: {
            type: Date,
        },
        // Actual end time of the ride
        endTime: {
            type: Date,
        },
        // Reference to rating or review
        ratingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    },
);

// Add GeoJSON indexes for geospatial queries
rideSchema.index({ source: "2dsphere" });
rideSchema.index({ destination: "2dsphere" });

// Create and export the Ride model
export const Ride = mongoose.model("Ride", rideSchema);
