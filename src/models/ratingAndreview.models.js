import mongoose, { Schema } from "mongoose";
import { Ride } from "./ride.models.js"; // Ride model
import { User } from "./user.model.js"; // User model
import { Driver } from "./driver.models.js"; // Driver model

// Define the schema for ratings and reviews
const ratingAndReviewSchema = new Schema(
    {
        // Reference to the associated Ride
        rideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride",
            required: true, // Mandatory field
        },
        // Reference to the User giving the review
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // Mandatory field
        },
        // Reference to the Driver being reviewed
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true, // Mandatory field
        },
        // Rating value (1 to 5)
        rating: {
            type: Number, // Use Number for numeric values
            required: true, // Rating is mandatory
            min: 1, // Minimum allowed rating
            max: 5, // Maximum allowed rating
        },
        // Optional review text
        review: {
            type: String, // Text review
            trim: true, // Removes extra spaces
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);



// Create and export the RatingAndReview model
export const RatingAndReview = mongoose.model(
    "RatingAndReview",
    ratingAndReviewSchema
);
