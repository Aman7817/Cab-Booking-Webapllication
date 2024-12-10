import mongoose,  { Schema } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.models.js";
import { User } from "../models/user.model.js";
import { Ride } from "../models/ride.models.js";


//Create a Payment: Process a new payment for a ride.
// Get All Payments: Fetch all payment records.
// Get Payment Details: Retrieve payment details by ID.
// Update Payment: Modify payment details (if applicable).
// Delete Payment: Remove a payment record.

const createPayment = asyncHandler(async(req,res) => {
    const {userId,rideId, amount,payment_Method,status} = req.body;

    if(!userId || !rideId || !payment_Method || !status || !amount) {
        throw new ApiError(400,"userId,rideId, amount,payment_Method and status are required.")
    }

    try {
        const ride = await Ride.findById(rideId);

        if(!ride){
            throw new ApiError(404,"Ride not found")
        }

        const user = await User.findById(userId)

        if(!user){
            throw new ApiError(404,"User not found")
        }

        const existingPayment = await Payment.findOne({rideId}) 
        if (existingPayment) {
            return res.status(200).json(
                new ApiResponse(200, existingPayment, "Payment for this ride already exists.")
            );
        }

        const newPayment = await Payment.create({
            rideId,
            userId,
            payment_Method,
            amount,
            status: status || "sucess" // Default to "success" if not provided
        });
        return res.status(201).json(
            new ApiResponse(201, newPayment, "Payment created successfully.")
        );
    } catch (error) {
        throw new ApiError(500, "An error occurred while processing the payment.")
    }
});


const getAllPayments = asyncHandler(async(req,res) => {
    try {
         // Fetch all payment records
        const payments = await Payment.find().populate("userId rideId");

        if(payments.length === 0){
            throw new ApiError(400,"No Payment found")
        }

        return res.status(200).json(
            new ApiResponse(200,payments,"Payments fetched successfully")
        )


    } catch (error) {
        throw new ApiError(500, "Error fetching payments");
    }

});
const getPaymentDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch payment by ID and populate user details (name and email)
        const payment = await Payment.findById(id).populate("userId", "name email");

        // Check if payment exists
        if (!payment) {
            throw new ApiError(404, "Payment not found");
        }

        // Return the payment details
        return res.status(200).json(
            new ApiResponse(200, payment, "Payment details retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error retrieving payment details");
    }
});



const updatePayment = asyncHandler(async (req, res) => {
    const { id } = req.params; // Extract Payment ID from the route parameters
    const updates = req.body; // Fields to update from the request body

    try {
        // Find the payment by ID and update it
        const updatedPayment = await Payment.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true, // Apply validation rules defined in the model
        });

        // If no payment is found, throw a 404 error
        if (!updatedPayment) {
            throw new ApiError(404, "Payment not found");
        }

        // Return the updated payment details
        return res.status(200).json(
            new ApiResponse(200, updatedPayment, "Payment updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error updating payment");
    }
});


const deletePayment = asyncHandler(async (req, res) => {
    const { id } = req.params; // Extract the payment ID from the request parameters

    try {
        // Find and delete the payment by ID
        const deletedPayment = await Payment.findByIdAndDelete(id);

        // If no payment is found, throw an error
        if (!deletedPayment) {
            throw new ApiError(404, "Payment not found");
        }

        // Respond with a success message
        return res.status(200).json(
            new ApiResponse(200, null, "Payment deleted successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to delete payment");
    }
});

const getUserPayments = asyncHandler(async(req,res) => {
    const {userId} = req.body;

    try {
        const payments = await Payment.find({userId})
            .populate("rideId","source destination status")
            .populate("userId", "name email")



        if(payments.length === 0){
            throw new ApiError(404," No Payment found for this User")
        }

        return res.status(200).json(
            new ApiResponse(200,payments,"User's payments fetched successfully")
        )
        
    } catch (error) {
        throw new ApiError(500, "Error fetching user's payments");
    }
});

const getFailedPayments = asyncHandler(async(req,re) => {
    try {
        const failedPayments = await Payment.find({status : "failed"});

        if(!failedPayments.length){
            throw new ApiError(404,"No failed payments found")
        }
        return res.status(200).json(
            new ApiResponse(200, failedPayments, "Failed payments fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching failed payments");
    }
});

//Payment Summary for Admin:

const getPaymentSummary = asyncHandler(async (req, res) => {
    try {
        const totalPayments = await Payment.countDocuments(); // Isse aapko total payments ka number milega.
        const totalAmount = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]);

        // Get the total number of failed payments
        const failedPayments = await Payment.countDocuments({ status: 'failed' });

        // Prepare the summary data
        const summary = {
            totalPayments,
            totalAmount: totalAmount[0]?.totalAmount || 0,
            failedPayments,
        };

        return res.status(200).json(
            new ApiResponse(200, summary, 
                "Payment summary fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching payment summary");
    }
});

export {
    createPayment,
    getAllPayments,
    updatePayment,
    deletePayment,
    getUserPayments,
    getFailedPayments,
    getPaymentSummary,
};


