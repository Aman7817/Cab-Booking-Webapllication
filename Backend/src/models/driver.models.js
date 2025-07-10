import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

// Define the schema for a driver
const driverSchema = new mongoose.Schema(
    {
        // Driver's username
        driverName: {
            type: String,
            required: true,
            trim: true,
        },
        // Driver's full name
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        // Driver's date of birth
        birth_date: {
            type: Date,
            required: true,
        },
        // Driver's email (must be unique)
        email: {
            type: String,
            required: true,
            unique: true,
        },
        // Driver's password (stored as a hash)
        password: {
            type: String,
            required: true,
        },
        // Driver's phone number
        phone: {
            type: String,
            required: true,
        },
        // Driver's license number (must be unique)
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
        },
        // online or offline status
        isAvailable: {
            type: Boolean,
            default: true, // by default, the driver is offline
        },

        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        role:{
            type: String,
            enum: ["user", "driver"],
            required: true ,
        },
        
        // Token for refreshing access tokens
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

driverSchema.index({ location: "2dsphere" }); // GeoJSON index

// Middleware to hash the password before saving a driver document
driverSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare a given password with the hashed password
driverSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate an access token for the driver
driverSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            driverName: this.driverName,
            fullName: this.fullName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Method to generate a refresh token for the driver
driverSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};


driverSchema.statics.getNearbyDrivers = async (sourceLocation) => {
    console.log("Longitude:", sourceLocation.longitude);
console.log("Latitude:", sourceLocation.latitude);

    const drivers = await Driver.find({
       isAvailable: true,
       location: {
          $near: {
             $geometry: {
                type: "Point",
                coordinates: [sourceLocation.longitude, sourceLocation.latitude], // [longitude, latitude]
             },
             $maxDistance: 5000, // For example, 5 km radius
          },
       },
    }).exec();
    console.log("Found nearby drivers:", drivers);
 
    return drivers;
 };
 
// Method to update driver availability
driverSchema.methods.updateAvailability = async function (status) {
    try {
        this.isAvailable = status;
        await this.save();
        return this.isAvailable;
    } catch (error) {
        // console.error("Error updating driver availability:", error.message);
        throw new ApiError(500, "Failed to update driver availability");
    }
};

// Create and export the Driver model
export const Driver = mongoose.model("Driver", driverSchema);
