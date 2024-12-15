import mongoose, {Schema} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RatingAndReview } from "../models/ratingAndreview.models.js";

const addRatingAndReview = asyncHandler(async(req,res) => {
    const {rideId,userId,driverId,rating, review } = req.body;

    if(!rideId || !userId || !driverId || !rating || !review){
        throw new ApiError(400," Ride ID, User ID, Driver ID, and Rating are required. ");
    }
    const newReview = await RatingAndReview.create({
        rideId,
        userId,
        driverId,
        rating,
        review,
    });

    return res.status(201).json(
        new ApiResponse(201, newReview, "Review added successfully.")
    );

});

// Get all reviews for a specific driver

const getReviewForDriver = asyncHandler(async(req,res) => {
    const {driverId} = req.params;

    const reviews = await RatingAndReview.find({driverId}).populate("userId","name email");

    if (!reviews.length) {
        throw new ApiError(404, "No reviews found for this driver.");
    }
    return res.status(200).json(
        new ApiResponse(200, reviews, "Driver reviews fetched successfully.")
    );
});
// Get all reviews by a specific user

const getUserReviews = asyncHandler(async(req,res) => {
    const {userId} = req.params;

    const reviews = await RatingAndReview.find({userId}).populate("rideId","name email");

    if (!reviews.length) {
        throw new ApiError(404, "No reviews found for this user.");
    }

    return res.status(200).json(
        new ApiResponse(200, reviews, "User reviews fetched successfully.")
    );
});

// Calculate driver's average rating

const calculateDriverAverageRating = asyncHandler(async(req,res) => {
    const {driverId} = req.params;

    const reviews = await RatingAndReview.find({driverId});

    if(!reviews.length){
        throw new ApiError(404, "No reviews found for this driver.");
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating,0);
    const averageRating = (totalRating / reviews.length).toFixed(2);

    return res.status(200).json(
        new ApiResponse(200, { averageRating }, "Driver average rating calculated successfully.")
    );
});

export {
    addRatingAndReview,
    getReviewsForDriver,
    getUserReviews,
    calculateDriverAverageRating,
};