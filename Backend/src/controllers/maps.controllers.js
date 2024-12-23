import axios from "axios"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";

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

export {
    getCoordinates
}
