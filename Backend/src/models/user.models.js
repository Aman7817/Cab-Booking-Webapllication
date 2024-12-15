import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the user Schema for MongoDB
const userSchema = new Schema(
    {
        // Username field: Must be unique and lowercase
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true, // Removes extra spaces
            lowercase: true,
            index: true // Index for faster queries
        },
        // Full name of the user
        fullname: {
            type: String,
            required: false,
            // trim: true, // Removes extra spaces
            // index: true
        },
        // URL or path of the user's avatar image
        avatar: {
            type: String,
            required: false,
        },
        email: { 
            type: String, 
            required: true,
            unique: true 
        },
        // Password field: Must be hashed before saving
        password: {
            type: String,
            required: true,
            length: 8, // Minimum password length
            select: false,
        },
        // User's phone number
        phone: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "driver"], // Valid roles
            required: true,
          },
        // Token for refreshing access tokens
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        // Automatically add `createdAt` and `updatedAt` timestamps
        timestamps: true
    }
);

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
    // If the password is not modified, skip hashing
    if (!this.isModified("password")) return next();

    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if the provided password matches the stored hash
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
        throw new Error("Password or hash not provided");
    }
    return await bcrypt.compare(password, this.password);
};

// Method to generate an access token
userSchema.methods.generateAccessToken = function () {
    

    return jwt.sign(
        {
            _id: this._id, // User's unique ID

            email: this.email, // User's email
            username: this.username, // Username
            fullname: this.fullname ,// Full name
            role: this.role, // Include role
            
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key from environment variables
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Token expiry duration
        }
    );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id, // User's unique ID
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for refresh tokens
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Refresh token expiry duration
        }
    );
};

// Create and export the User model
export const User = mongoose.model("User", userSchema);
