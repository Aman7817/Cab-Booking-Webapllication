import mongoose,{Schema} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { Ride } from "../models/ride.models.js";
import { Driver } from "../models/driver.models.js";
import {User} from "../models/user.models.js";
import {sendEmail} from "../utils/mailService.js";

const createRide = asyncHandler(async(req,res) => {
   try {
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
         status: scheduledTime ? "scheduled" : "pending" , // Future booking if scheduledTime exists 
         scheduledTime,
     });

     // Send email confirmation to the user
     const userEmail = user.email;  // Dynamically get the user's email
     const subject = "Ride Confirmation";
     const text = `Your ride from ${source} to ${destination} has been successfully booked. Price: ${Price}`;
 
     // Send confirmation email
     await sendEmail(userEmail, subject, text);
 
     // Prepare and send the response
   
     return res.status(201).json(
      new ApiResponse(201, ride,"Ride booked successfully")
   );
     

     
   } catch (error) {
        throw new ApiError(500,"somthing went wrong while creating  the ride")
    
   }


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
      if(ride.status !== "pending" && ride.status !== "scheduled"){
         throw new ApiError(400,"Ride is not eligible for driver assignment")
      }

      // fecth driver 

      const driver = await Driver.findById(driverId);
      if(!driver){
         throw new ApiError(404,"Driver not found");
      }

      // assign driver and vehicle 
      ride.driverId = driverId;
      ride.vehicleId = vehicleId;
      ride.status = "pending"; // Update status to indicate driver is assigned
      const save = await ride.save();

      const driverEmail = driver.email;
      const driverSubject = "Ride Assignment";
      const driverText = `You have been assigned to a ride from ${ride.source} to ${ride.destination}.`;
      await sendEmail(driverEmail, driverSubject, driverText);
      
      const response  = new ApiResponse(200,ride," Driver and vehicle assigned successfully");
      return res.status(200).json(response)

     } catch (error) {
         throw new ApiError(500,"Something went wrong while assigning the driver")
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
   if(ride.status === "cancelled"){
      throw new ApiError(400,"this ride is already cancelled");
   }

   // If ride status is already cancelled, no further action needed

   ride.status = "cancelled";
   const save = await ride.save();
   
   // notify the user and driver about the cancellation
    // Send email to user
   const user = await User.findById(ride.userId);
   const userEmail = user.email;
   const userSubject = "Ride cancellation";
   const userText =  ` Your ride from${ride.source} to ${rid.destination} has been cancelled.`;
   await sendEmail(userEmail,userSubject,userText);

    // Send email to driver
   const driver  = await Driver.findById(ride.driverId);
   if (driver) {
      const driverEmail = driver.email;
      const driverSubject = "Ride Cancellation";
      const driverText = `The ride from ${ride.source} to ${ride.destination} has been cancelled.`;
      await sendEmail(driverEmail, driverSubject, driverText);
  }

  // return response 

  return res.status(201).json(
   throw new ApiResponse(201, ride,"Ride cancelled successfully")
  )
});

// User's  ride history

const getRideHistory = asyncHandler(async(req,res) => {
   const {userId} = req.body;

   if(userId) {
      throw new ApiError(404,"Useer id is required");
   }

   // fetch the all rides 

   const rides = await Ride.find({userId})
   .sort({createdAt: -1}) // most recent rides first
   .populate("driverId", "name email") // Populate driver details (optional)
   .populate("vehicleId", "car_model") // Populate vehicle details (optional)
   
   if(!rides || rides.length === 0) {
      throw new ApiError(400,"no rides found for the user")
   }

   // return the ride history 

   return res.status(200).json(
      throw new ApiResponse(200, rides ," ride history fetched successfully");
   )
})


export {
   createRide,
   assignDriver,
   cancelRide,
   getRideHistory

};