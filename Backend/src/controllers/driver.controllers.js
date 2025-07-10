import { asyncHandler } from "../utils/asyncHandler.js";
import { Driver } from "../models/driver.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (driverId) => {
   try {
      const driver = await Driver.findById(driverId);
      const accessToken = await driver.generateAccessToken();
      const refreshToken = await driver.generateRefreshToken();
      driver.refreshToken = refreshToken;
      await driver.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
   } catch (error) {
      throw new ApiError(501, "Something went wrong while generating access and refresh token");
   }
};

// Register Driver
const registerDriver = asyncHandler(async (req, res) => {
   console.log("request body",req.body);
   
   const { fullName, email, phone, driverName, password ,role,licenseNumber,birth_date, location} = req.body;
   console.log("driverName", driverName);

   // Check for empty fields
   if (
      [fullName, email, phone, driverName, password, role, licenseNumber, birth_date].some((field) => !field?.trim()) ||
      !Array.isArray(location?.coordinates) || location.coordinates.length !== 2
   ) {
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
      driverName: driverName.toLowerCase(),
      role,
      licenseNumber,
      birth_date,
      location
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
   }).select("+password");

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
   const loggedInDriver = await Driver.findById(driver._id).lean();
   delete loggedInDriver.password
   delete loggedInDriver.refreshToken

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

const loggedOutDriver = asyncHandler(async (req, res) => {
   try {
      // Update the driver's refreshToken to undefined in the database
      await Driver.findByIdAndUpdate(
         req.user._id,
         {
            $set: {
               refreshToken: undefined,  // Corrected typo here
            }
         },
         {
            new: true,
         }
      );

      // Set options for clearing cookies
      const options = {
         httpOnly: true,
         secure: true  // Use secure cookies in production
      };

      // Clear cookies and send response
      return res
         .status(200)
         .clearCookie("accessToken", options)
         .clearCookie("refreshToken", options)
         .json(
            new ApiResponse(200, {}, "Driver logged out successfully")
         );
   } catch (error) {
      console.error("Logout Error:", error);  // Log the error for debugging
      throw new ApiError(500, "Something went wrong during logout");
   }
});

const getAllDrivers = asyncHandler(async(req,res) => {
    try {
        const drivers = await Driver.find().select("name email");
        if(!drivers.length) {
            throw new ApiError(404,"No Drivers found");
        }
        // send response with vehicles

        return res.status(200).json(
            new ApiResponse(200,drivers,"Drivers  retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(500,error.message || "Failed to retrieve Drivers")
    }

});
// ye useer aur vehicle mein bhi likna hai
const getDriverCount = asyncHandler(async (req, res) => {
   try {
       // Count the number of drivers
       const driverCount = await Driver.countDocuments();

       return res.status(200).json(
           new ApiResponse(200, { driverCount }, "Driver count retrieved successfully")
       );
   } catch (error) {
       throw new ApiError(500, error.message || "Failed to retrieve driver count");
   }
});

// ye controlers user mein bhi likhna hai 
const getDriverCountByStatus = asyncHandler(async (req, res) => {
   try {
       // Count drivers with a specific status, e.g., active drivers
       const activeDriverCount = await Driver.countDocuments({ status: 'active' });

       return res.status(200).json(
           new ApiResponse(200, { activeDriverCount }, "Active driver count retrieved successfully")
       );
   } catch (error) {
       throw new ApiError(500, error.message || "Failed to retrieve active driver count");
   }
});


export {
   registerDriver,
   loginDriver,
   loggedOutDriver,
   getAllDrivers,
   getDriverCount,
   getDriverCountByStatus
};
