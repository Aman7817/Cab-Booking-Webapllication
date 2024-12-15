import dotenv from "dotenv";
import portfinder from "portfinder";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config(); // Automatically looks for .env in the root folder


// Connect to MongoDB
connectDB()
    .then(() => {
        // Find an available port
        portfinder.basePort = process.env.PORT || 8001; // Starting point for portfinder
        portfinder.getPort((err, port) => {
            if (err) {
                console.log("Error finding available port:", err);
                process.exit(1); // Exit if port finding fails
            }
            app.listen(port, () => {
                console.log(`Server is running at Port: ${port}`);
            });
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed!!", error);
    });
