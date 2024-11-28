import { ApiError } from "../utils/ApiError";  // Custom error class for API errors
import { asyncHandler } from "../utils/asyncHandler";  // Helper function for handling async errors
import jwt from "jsonwebtoken";  // JWT library for token verification
import { User } from "../models/user.model.js";  // Import User model
import { Driver } from "../models/driver.model.js";  // Import Driver model

// JWT verification middleware for both User and Driver
export const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        // Step 1: Extract the token from cookies or the authorization header
        const token = req.cookies?.accessToken || 
                      req.header("authorization")?.replace("Bearer", "").trim();

        // Step 2: If no token is found, return an unauthorized error
        if (!token) {
            throw new ApiError(401, "Unauthorized request. Token not provided.");
        }

        // Step 3: Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Step 4: Check if the token is for a user or driver based on role
        let userOrDriver;
        if (decodedToken.role === "user") {
            // Fetch user from the User model
            userOrDriver = await User.findById(decodedToken?._id).select("-password -refreshToken");
        } else if (decodedToken.role === "driver") {
            // Fetch driver from the Driver model
            userOrDriver = await Driver.findById(decodedToken?._id).select("-password -refreshToken");
        }

        // Step 5: If the user/driver doesn't exist, throw an unauthorized error
        if (!userOrDriver) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Step 6: Attach the user or driver to the request object
        req.user = userOrDriver;

        // Move to the next middleware or route handler
        next();
    } catch (error) {
        // Step 7: Catch any error and return an unauthorized response
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});
