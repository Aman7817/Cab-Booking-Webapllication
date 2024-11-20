import mongoose, { Schema } from "mongoose"; // Import Mongoose and Schema from Mongoose

// Define the schema for payment details
const paymentSchema = new Schema(
    {
        // Reference to the associated Ride
        rideId: {
            type: mongoose.Schema.Types.ObjectId, // Stores the ObjectId of the Ride
            ref: "Ride", // Refers to the Ride model
            required: true, // Mandatory field
        },
        // Reference to the User making the payment
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Stores the ObjectId of the User
            ref: "User", // Refers to the User model
            required: true, // Mandatory field
        },
        // Payment amount for the ride
        amount: {
            type: Number, // Stores the payment amount as a number
            required: true, // Mandatory field
        },
        // Method of payment (e.g., cash, card, online, etc.)
        payment_Method: {
            type: String, // Stores the payment method as a string
            required: true, // Mandatory field
        },
        // Status of the payment
        status: {
            type: String, // Stores the status as a string
            enum: ["success", "failed"], // Allowed values for status
            default: "success", // Default value for the status
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the Payment model
export const Payment = mongoose.model("Payment", paymentSchema);
