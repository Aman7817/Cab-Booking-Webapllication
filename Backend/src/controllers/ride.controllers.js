import mongoose,{Schema} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { Ride } from "../models/ride.models.js";
import { Driver } from "../models/driver.models.js";
import {User} from "../models/user.models.js";
import {sendEmail} from "../utils/mailService.js";

// Define ride statuses

// Ride statuses like pending, scheduled, cancelled ko hardcoded nhi rakhne ke liye .
// Ek status enum ya constant object define kiya hai:
const Ridestatus = {
   PENDING: "pending",
   SCHEDULED: "scheduled",
   CANCELLED: "cancelled",
   COMPLETED: "completed",
};

// Email templates utility

 // Emails ke text aur subjects baar-baar likhe gaye hain. to 
 //Ek template utility function banaya jo dynamic inputs ke basis par email content return karta hai.
const emaiTemplates = {
   rideConfermation: (source,destination,price) => 
      `Your ride from ${source} to ${destination} has been successfully booked. Price: ${price}`,
   rideAssignment: (source,destination) => 
      `You have been assigned to a ride from ${source} to ${destination}.`,
   rideCancellation: (source,destination) => 
      `The ride from ${source} to ${destination} has been cancelled.`,
};

const createRide = asyncHandler(async(req,res) => {
   
     const {userId,source,destination,Price,distance,scheduledTime} = req.body;

     if(!userId || !source || !destination || !distance || !Price) {
        throw new ApiError(400,"All fields must be provided");
     }

      // Fetch the user to get the email
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
 
     // Create the ride
 
     const ride = await Ride.create({
         userId,
         source,
         destination,
         Price,
         distance,
         status: scheduledTime ? RideStatus.SCHEDULED : RideStatus.PENDING, // Future booking if scheduledTime exists 
         scheduledTime,
     });

     // Send email confirmation to the user

     // Phir sendEmail me templates ka use kiya hai :
      const emailContent = emaiTemplates.rideConfermation(source,destination,Price);
      await sendEmail(user.email,"Ride confermation",emailContent);

   //   const userEmail = user.email;  // Dynamically get the user's email
   //   const subject = "Ride Confirmation";
   //   const text = `Your ride from ${source} to ${destination} has been successfully booked. Price: ${Price}`;
 
     // Send confirmation email
   //   await sendEmail(userEmail, subject, text);
 
     // Prepare and send the response
   
     return res.status(201).json(
      new ApiResponse(201, ride,"Ride booked successfully")
   );
     

});

const assignDriver = asyncHandler(async(req,res) => {
   
     try {
       const {rideId,driverId,vehicleId} = req.body;
 
       if (!rideId || !driverId || ! vehicleId) {
          throw new ApiError(400,"rideId ,driverId and vehicleId are required")
       }
 
       // fetch the ride
 
      const ride = await Ride.findById(rideId);
      
      if(!ride){
         throw new ApiError(404,"Ride not found")
      }
       // Check if the ride is eligible for driver assignmen
      if(![RideStatus.PENDING, RideStatus.SCHEDULED].includes(Ride.status)){
         throw new ApiError(400,"Ride is not eligible for driver assignment")
      }

      // fecth driver 

      const driver = await Driver.findById(driverId);
      if(!driver){
         throw new ApiError(404,"Driver not found");
      }
      // Mark the driver as unavilable
      // driver.isAvailable = false;
      // await driver.save();
      if (!driver.isAvailable) {
         throw new ApiError(400, "Driver is not available.");
       }

      // Mark driver as unavailable
      const isUpdated = await driver.updateAvailability(false); // set driver to offline
      // console.log(`Driver availability updated: ${isUpdated}`);


      // assign driver and vehicle 
      ride.driverId = driverId;
      ride.vehicleId = vehicleId;
      ride.status = Ridestatus.PENDING // Update status to indicate driver is assigned
      const savedRide = await ride.save();
      // notify driver
      const emailContent = emaiTemplates.rideAssignment(ride.source,ride.destination);
      await sendEmail(driver.email,"Ride Assignment", emailContent);
      // const driverEmail = driver.email;
      // const driverSubject = "Ride Assignment";
      // const driverText = `You have been assigned to a ride from ${ride.source} to ${ride.destination}.`;
      // await sendEmail(driverEmail, driverSubject, driverText);
      

      const response  = new ApiResponse(200,ride," Driver and vehicle assigned successfully");
      return res.status(200).json(response)

     } catch (error) {
         throw new ApiError(500,"Something went wrong while vehicle  assigning the driver")
     }
});

// ride cancellation controler 

const cancelRide = asyncHandler(async(req,res) => {
   const {rideId} = req.body;

   if(!rideId) {
      throw new ApiError(404,"rideId is required")
   }

   // fetch the ride from the database

   const ride = await Ride.findById(rideId);

   if(!ride){
      throw new ApiError(400,"Ride not found")
   }
   // If ride status is already cancelled, no further action needed
   if(ride.status === Ridestatus.CANCELLED){
      throw new ApiError(400,"this ride is already cancelled");
   }

   // If ride status is already cancelled, no further action needed

   ride.status = Ridestatus.CANCELLED;
   ride.isAvailable = true;
   const cancelleRide = await ride.save();
   
   // notify the user and driver about the cancellation
    // Send email to user
   const user = await User.findById(ride.userId);
   if(user) {
      const emailContent = emaiTemplates.rideCancellation(ride.source,ride.destination);
      await sendEmail(user.email, "Ride cancellation ", emailContent);
   }
   // const userEmail = user.email;
   // const userSubject = "Ride cancellation";
   // const userText =  ` Your ride from${ride.source} to ${rid.destination} has been cancelled.`;
   // await sendEmail(userEmail,userSubject,userText);

    // Send email to driver
   const driver  = await Driver.findById(ride.driverId);
   if (driver) {

      await driver.updateAvailability(true); 

      const emailContent = emaiTemplates.rideCancellation(ride.source,ride.destination);
      await sendEmail(driver.email,"Ride cancellation",emailContent)
      // const driverEmail = driver.email;
      // const driverSubject = "Ride Cancellation";
      // const driverText = `The ride from ${ride.source} to ${ride.destination} has been cancelled.`;
      // await sendEmail(driverEmail, driverSubject, driverText);
  }

  // return response 

  return res.status(201).json(
    new ApiResponse(201, ride,"Ride cancelled successfully")
  )
});


// complete ride controller

// Controller to update ride status to completed
const completeRide = asyncHandler(async (req, res) => {
   const { rideId } = req.body;

   if (!rideId) {
       throw new ApiError(400, "rideId is required");
   }

   // Fetch the ride
   const ride = await Ride.findById(rideId);
   if (!ride) {
       throw new ApiError(404, "Ride not found");
   }

   // Update ride status to completed
   ride.status = RideStatus.COMPLETED;

   const completedRide = await ride.save();

   // Update driver's availability
   const driver = await Driver.findById(ride.driverId);
   if (driver) {
       await driver.updateAvailability(true); // set driver to available
   }

   return res.status(200).json(new ApiResponse(200, completedRide, "Ride completed successfully"));
});

// Controller to get nearby drivers

const getNearbyDrivers = asyncHandler(async(req,res) => {
   const {longitude,latitude} = req.body;

   if(!longitude || !latitude) {
      throw new ApiError(400,"Longitude and Latitude are required");
   }

   const nearbyDrivers = await Driver.getNearbyDrivers({longitude,latitude});

   if(nearbyDrivers.length === 0){
      throw new ApiError(404,"No avilable drivers nearby");

   }

   return res.status(200).json(
      new ApiResponse(200, nearbyDrivers,"Nearby drivers fetched successfully")
   )
});


// User's  ride history

const getRideHistory = asyncHandler(async (req, res) => {
   const { userId, startDate, endDate } = req.body;

   // Validate required fields
   if (!userId) {
      throw new ApiError(404, "User ID is required");
   }

   if (!startDate || !endDate) {
      throw new ApiError(400, "Both startDate and endDate are required");
   }

   try {
      // Fetch rides based on userId and date range
      const rides = await Ride.find({
         userId,
         createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
         },
      })
         .sort({ createdAt: -1 }) // Most recent rides first
         .populate("driverId", "name email") // Populate driver details (optional)
         .populate("vehicleId", "car_model"); // Populate vehicle details (optional)

      // If no rides found
      if (!rides || rides.length === 0) {
         throw new ApiError(404, "No rides found for the user in the given date range");
      }

      // Return the ride history
      return res.status(200).json(
         new ApiResponse(200, rides, "Ride history fetched successfully")
      );
   } catch (error) {
      // Handle unexpected errors
      throw new ApiError(500, "An error occurred while fetching ride history");
   }
});





export {
   createRide,
   assignDriver,
   cancelRide,
   getRideHistory,
   getNearbyDrivers,
   completeRide,


};