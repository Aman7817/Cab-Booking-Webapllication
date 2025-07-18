import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import path from "path";

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
// CORS allows the backend to accept requests from specified origins (e.g., frontend)
app.use(cors({
    origin: process.env.CORS_ORIGIN,    // The allowed origin for requests (usually the frontend URL)
    credentials: true                   // Allows cookies and credentials to be sent with requests
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files from the "backend" folder (for testing purpose)
app.use(express.static(path.join(__dirname, "Backend"))); // Backend folder ko static serve karenge

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Backend", "index.html"));
});
// Middleware to parse JSON bodies in incoming requests
// The 'limit' option restricts the maximum size of the JSON payload
app.use(express.json({ limit: "20kb" }));

// Middleware to parse URL-encoded data in requests (e.g., form submissions)
// 'extended' allows you to send complex objects, 'limit' restricts the payload size
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// Serve static files from the 'public' directory
// This allows you to serve images, CSS files, JavaScript files, etc., from the 'public' folder
app.use(express.static('public')); // 'kuch bhe images ya or kuch bhe rakh ne ke liye' (comment in Urdu)

// Middleware to parse cookies from incoming requests
app.use(cookieParser()); // To access cookies sent by the client in `req.cookies`



// import routes
import userRouter from "./routes/user.routes.js";
import driverRouter from "./routes/driver.routes.js";
import vehicleRouter from "./routes/vehicle.routes.js"
import PaymentRouter from "./routes/payment.routes.js";
import mapRouter from"./routes/maps.routes.js"
import ridebookingRouter from "./routes/routes.booking.js"

// routes declaration
app.use("/api/v1/users", userRouter); // Use userRouter for user-related routes
app.use("/api/v1/drivers",driverRouter) // use driverRouter for driver-related routes
app.use("/api/v1/vehicles",vehicleRouter) // use vehicleRoute for vehicle related routes
app.use("/api/v1/payment", PaymentRouter); // Use PaymentRouter for payment-related routes
app.use("/api/v1/coordinates",mapRouter)
app.use("/api/v1/booking",ridebookingRouter)

// http://localhost:8000/api/v1/payment/payments

export { app };
