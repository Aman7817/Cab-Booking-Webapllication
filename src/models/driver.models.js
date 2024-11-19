import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"; // Library for creating and verifying JSON Web Tokens
import bcrypt from "bcrypt"; // Library for hashing and comparing passwords

// Define the schema for a driver
const driverSchema = new Schema(
    {
        // Driver's username
        driverName: {
            type: String,
            required: true, // Mandatory field
            trim: true, // Removes extra spaces
        },
        // Driver's full name
        fullname: {
            type: String,
            required: true, // Mandatory field
            trim: true, // Removes extra spaces
        },
        // Driver's date of birth
        birth_date: {
            type: Date,
            required: true, // Mandatory field
        },
        // Driver's email (must be unique)
        email: {
            type: String,
            required: true, // Mandatory field
            unique: true, // Ensures no two drivers can have the same email
        },
        // Driver's password (stored as a hash)
        password: {
            type: String,
            required: true, // Mandatory field
        },
        // Driver's phone number
        phone: {
            type: String,
            required: true, // Mandatory field
        },
        // Driver's license number (must be unique)
        licenseNumber: {
            type: String,
            required: true, // Mandatory field
            unique: true, // Ensures no two drivers can have the same license number
        },
        // Token for refreshing access tokens
        refreshToken: {
            type: String, // Optional field
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Middleware to hash the password before saving a driver document
driverSchema.pre("save", async function (next) {
    // If the password is not modified, skip hashing
    if (!this.isModified("password")) {
        return next();
    }

    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare a given password with the hashed password
driverSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // Returns true or false
};

// Method to generate an access token for the driver
driverSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this.id, // Unique identifier for the driver
            email: this.email, // Driver's email
            driverName: this.driverName, // Driver's username
            fullname: this.fullname, // Driver's full name
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Token expiry duration
        }
    );
};

// Method to generate a refresh token for the driver
driverSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id, // Unique identifier for the driver
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the refresh token
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Refresh token expiry duration
        }
    );
};

// Create and export the Driver model
export const Driver = mongoose.model("Driver", driverSchema);
