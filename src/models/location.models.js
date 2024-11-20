import mongoose, { Schema } from "mongoose"; // Import mongoose and Schema
import { User } from "./user.model.js"; // User model import
import { Driver } from "./driver.model.js"; // Driver model import

// Define the Location schema
const locationSchema = new mongoose.Schema(
    {
        // Reference to the User who has the location
        userId: {
            type: mongoose.Schema.Types.ObjectId, // ObjectId type to link to User collection
            ref: 'User', // Reference to the "User" model
            required: false, // If userId is not always required, keep it as false
        },
        // Reference to the Driver who has the location
        driverId: {
            type: mongoose.Schema.Types.ObjectId, // ObjectId type to link to Driver collection
            ref: "Driver", // Reference to the "Driver" model
            required: false, // If driverId is not always required, keep it as false
        },
        // Latitude of the location
        latitude: {
            type: Number, // Number to store the latitude coordinate
            required: true, // Latitude is required for a location entry
        },
        // Longitude of the location
        longitude: {
            type: Number, // Number to store the longitude coordinate
            required: true, // Longitude is required for a location entry
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the Location model
const Location = mongoose.model("Location", locationSchema);
export { Location };
