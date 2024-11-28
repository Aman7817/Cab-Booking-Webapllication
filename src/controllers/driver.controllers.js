import { asyncHandler } from "../utils/asyncHandler.js";
import { Driver } from "../models/driver.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (driverId) => {
   try {
      const driver = await Driver.findById(driverId);
      const accessToken = driver.generateAccessToken();
      const refreshToken = driver.generateRefreshToken();
      driver.refreshToken = refreshToken;
      await driver.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
   } catch (error) {
      throw new ApiError(501, "Something went wrong while generating access and refresh token");
   }
};

// Register Driver
const registerDriver = asyncHandler(async (req, res) => {
   const { fullName, email, phone, driverName, password } = req.body;
   console.log("driverName", driverName);

   // Check for empty fields
   if ([fullName, email, phone, driverName, password].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
   }

   // Check if the driver already exists
   const existingDriver = await Driver.findOne({
      $or: [{ driverName }, { email }, { phone }]
   });
   if (existingDriver) {
      throw new ApiError(409, "Driver with this email, phone, or driverName already exists");
   }

   // Create the new driver in the database
   const newDriver = await Driver.create({
      fullName,
      email,
      password,
      phone,
      driverName: driverName.toLowerCase()
   });

   // Retrieve created driver and exclude sensitive fields
   const createdDriver = await Driver.findById(newDriver._id).select("-password -refreshToken");
   if (!createdDriver) {
      throw new ApiError(500, "Something went wrong while registering the driver");
   }

   // Send success response
   return res.status(201).json(
      new ApiResponse(200, createdDriver, "Driver registered successfully")
   );
});

// Login Driver
const loginDriver = asyncHandler(async (req, res) => {
   const { email, phone, driverName, password } = req.body;

   // Check for required fields
   if (!driverName && !email && !phone) {
      throw new ApiError(400, "DriverName, email, or phone is required");
   }

   // Find the driver
   const driver = await Driver.findOne({
      $or: [{ driverName }, { email }, { phone }]
   });

   if (!driver) {
      throw new ApiError(404, "Driver does not exist");
   }

   // Validate password
   const passwordIsValid = await driver.isPasswordCorrect(password);
   if (!passwordIsValid) {
      throw new ApiError(401, "Wrong password");
   }

   // Generate tokens
   const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(driver._id);

   // Exclude sensitive fields
   const loggedInDriver = await Driver.findById(driver._id).select("-password -refreshToken");

   // Cookie options
   const options = {
      httpOnly: true,
      secure: true
   };

   // Send response
   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(200, { driver: loggedInDriver, accessToken, refreshToken }, "Driver logged in successfully")
      );
});


export {
   registerDriver,
   loginDriver
};
