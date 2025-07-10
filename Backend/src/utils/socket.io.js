import { Server as socketIo, Socket } from "socket.io";  // Corrected import
import { ApiError } from "./ApiError.js";
import { getNearbyDrivers } from "../controllers/ride.controllers.js";
import { Driver } from "../models/driver.models.js";

let io;

const initSocket = (server) => {
    io = new socketIo(server, {
        cors: {
            origin: "*", // Allow all origins (could be restricted in production)
        }
    });

    io.on("connection", (socket) => {  // 'connection' event should be lowercase
        console.log("New client connected: ", socket.id);

        // Handle ride request
    socket.on("rideRequest", async (data) => {
        console.log("Ride requested", data);

        // Find nearby drivers
        const getNearbyDrivers = await Driver.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [data.longitude, data.latitude],
                    },
                    $maxDistance: 5000, // max distance in meters
                },
            },
        });

        console.log("Found nearby drivers:", getNearbyDrivers);

        // Emit "newRide" event with driver data to all clients
        io.emit("newRide", {
            rideRequest: data,
            drivers: getNearbyDrivers,
        });
    });
        socket.on("acceptRide",(data) => {
            console.log("Ride accepted",data);
            io.emit("rideAccept",data);
            
        });

        socket.on("UpdateLocation" ,(data) => {
            console.log(" Driver  Location Updated " , data);
            io.emit("driverLocation", data)
            

        })

        // Listening for ride status updates
        socket.on("updateRideStatus", (data) => {
            console.log("Ride status Updated: ", data);
            // Broadcast updated ride status to all users
            io.emit("rideStatusUpdated", data);
        });

        // Handle disconnection
        socket.on("disconnect", () => {  // 'disconnect' event should be lowercase
            console.log("Client disconnected", socket.id);
        });
    });

    return io;
};

const getSocket = () => {
    if (!io) {
        throw new ApiError(400, "Socket.io not initialized");
    }
    return io;
};

export  {
    initSocket,
    getSocket
};
