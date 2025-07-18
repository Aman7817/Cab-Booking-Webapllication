import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`);

            console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.Connection.host || 'localhost'}`);
            


        
    } catch (error) {
        console.log(" MongoDB connection failed: ", error);
        
        process.exit(1);
    }
}

export default connectDB;