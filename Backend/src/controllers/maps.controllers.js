import axios from "axios"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const getCoordinates = asyncHandler(async(req ,res) => {
    const API_KEY = process.env.GOOGLE_MAPS_API

    const {address} = req.query;

    if(!address){
        throw new ApiError(400,"Address is required.")
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            res.json({ latitude: location.lat, longitude: location.lng });
        } else {
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }

});

const  getDistance = asyncHandler(async(req,res) => {
    const API_KEY = process.env.GOOGLE_MAPS_API;
    const {origin ,destination} = req.query;

    if(!origin || !destination){
        throw new ApiError(400 ,"Both origin and destination are required.")
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
            origin
        )}&destinations=${encodeURIComponent(destination)}&key=${API_KEY}`;

        const response = await axios.get(url);

        if(response.data.status == "ok"){
            const distanceInfo = response.data.rows[0].elements[0];

            if(distanceInfo.status == "ok"){
                const {disatance,duration } = distanceInfo;
                return res.status(200).json(
                    new ApiResponse(200,{disatance: disatance.text, duration: duration.text},"Distance calculated successfully")
                );

            } else{
                throw new ApiError(404,"Unable to calculate distance")
            }
        } else{
            throw new ApiError(500,"Failed to fetch distance data.")
        }
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to calculate distance.");
    }
});

const getNearbyLocation = asyncHandler(async(req,res) => {
    const API_KEY = process.env.GOOGLE_MAPS_API;
    const {latitude,longitude,radius,type } = req.query;

    if(!latitude || !longitude || !radius){
        throw new ApiError(400,"Latitude, longitude, and radius are required.")
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${API_KEY}`;

        const response = await axios.get(url);

        if(response.data.status == "ok"){
            const places = response.data.result.map((place) =>  ({
                name:place.name,
                address: place.vicinity,
                rating: place.rating || "N/A",
            }));

            return res.status(200).json(
                new ApiResponse(200,places,"Nearby locations retrieved successfully")
            );
        }else{
            throw new ApiError(404,response.data.error_message || "No locations found.")
        }

    } catch (error) {
        throw new ApiError(500, error.message || "Failed to retrieve nearby locations.");
    }
});

const savedFrequentRoute = asyncHandler(async(req,res) => {
    const {userId, origin,destination} = req.body;

    if(userId,origin,destination){
        throw new ApiError(400,"User ID, origin, and destination are required.")
    }
    try {
        const newRoute = await FrequentRoute.create({ userId, origin, destination });
        return res.status(201).json(
            new ApiResponse(201, newRoute, "Frequent route saved successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to save frequent route.");
    }
})

export {
    getCoordinates,
    getDistance,
    getNearbyLocation,
    savedFrequentRoute
}
