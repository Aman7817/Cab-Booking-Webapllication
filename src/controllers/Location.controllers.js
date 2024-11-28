import { Location } from "../models/location.models";
import { Driver } from "../models/driver.models";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// update driver location 

const updateDriverLocation = asyncHandler (async(req,res) => {
    const {driverId,latitude,longitude} = req.body;

    // check if driverId ,latitude and longtitude are provided

    if(!driverId || latitude == NULL || longitude == NULL) {
        throw new ApiErrorError(400,"DriverId ,latitude and longitude are required");
        
    }

    try {
        // update driver's location in the database

        const location = await Location.findOneAndUpdate(
            {driverId}, // find the existing driver by driverId
            {latitude,longitude}, // update the latitude and longitude
            {new: true, upsert: true} // if no record exists , create a new one 
        );

        // return the update location 
        return res.status(200).json({
            success: true,
            message: "Driver location updated succesfully",
            data: location
        });
        
    } catch (error) {
        throw new ApiError(500,"Error updating driver location")
    }
});

 // Update user location (for ride request)

const updateUserLocation = asyncHandler(async(req,res) => {
    const {userId , latitude,longitude} = req.body;
    // check if userId ,latitude and longitude are provided
    
    if(!userId || latitude == null || longitude == null  ) {
        throw new ApiError(400,"UserId ,latitude and longitude are required")
    }

    // update the user's location in the databse

   try {
     const location = await User.findByIdAndUpdate(
         {userId}, // find the existing user by userId
         {latitude,longitude}, // update the latitude and longitude
         {new:true, upsert: true} // if no record exists,cerate a new 
     );
 
     // return the update loctaion 
 
     return res.status(200).json({
         success: true,
         message: "User location updated succesfully",
         data: location
     });
   } catch (error) {
        throw new ApiError(500," Error updating user location")
     
   }

});

// get the driver location (for costomer to track) 

const getDriverLocation = asyncHandler(async(req,res) => {
    const {driverId} = req.params;

    if(!driverId){
        throw new Error(400,"Driver is required");

        
    }

    try {
        // fetch the driver's location from the database

        const location = await Location.findOne({driverId});

        if(!location) {
            throw new ApiError(404,"driver location not found");

        }

        // return the driver location 
        return res.status(200).json({
            success: true,
            message: " Driver location fetched successfully ",
            data: location
        });
    } catch (error) {
        throw new ApiError(500,"Error fetching driver location")
    }
});

// get user location (for admin or backend systems)

const getUserLocation = asyncHandler(async(req,res) => {
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400,"UsrId is required")
    }

    try {
        // fetch the user's location from the database
        const loctaion = await Location.findOne({userId});

        if(!loctaion){
            throw new ApiError(404,"User loctaion not found")
        }

        // return the users location 

        return res.status(200).json({
            success: true,
            message: "User location feched successfully",
            data: location 
        })
    } catch (error) {
       throw new ApiError(500,"Error fetching user location") 
    }
});

export {
    updateDriverLocation,
    updateUserLocation,
    getDriverLocation,
    getUserLocation
};