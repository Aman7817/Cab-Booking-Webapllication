import { ApiError } from "../utils/ApiError.js";  // Custom error class for API errors
import { asyncHandler } from "../utils/asyncHandler.js";  // Helper function for handling async errors
import jwt from "jsonwebtoken";  // JWT library for token verification
import { User } from "../models/user.models.js";  // Import User model
import { Driver } from "../models/driver.models.js";  // Import Driver model

// JWT verification middleware for both User and Driver
const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        // Extract the token from cookies or the authorization header
        let token = req.cookies?.accessToken || 
                    req.header("authorization")?.replace("Bearer", "").trim();

        console.log("Received Token from Cookies or Authorization Header:", token); // Log token

        // If token is an empty object or not a string, throw an error
        if (!token || typeof token !== "string") {
            throw new ApiError(401, "Unauthorized request. Token is missing or invalid.");
        }

        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Token:", decodedToken); // Log the decoded token

        // Check if the token has a valid role and if it's either 'user' or 'driver'
        if (!decodedToken.role || !['user', 'driver'].includes(decodedToken.role)) {
            throw new ApiError(401, "Invalid token role.");
        }

        // Fetch the user or driver based on role
        let userOrDriver;
        if (decodedToken.role === "user") {
            userOrDriver = await User.findById(decodedToken._id).select("-password -refreshToken");
        } else if (decodedToken.role === "driver") {
            userOrDriver = await Driver.findById(decodedToken._id).select("-password -refreshToken");
        } else {
            throw new ApiError(401, "Invalid token role.");
        }

        // If user or driver not found, throw error
        if (!userOrDriver) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach the user or driver to the request object
        req.user = userOrDriver;

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.error("Error in verifyjwt middleware:", error); // Log error
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

export default verifyjwt
