import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
//routes
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";


dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/rooms", roomRoutes);
app.use("/booking", bookingRoutes);
app.use("/dashboard", dashboardRoutes);

//health check
app.get("/", (req, res) => {
    res.send("Hotel Admin API running");
})

//database function test server
testDatabase();

//start server
app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`)
})

//database test
async function testDatabase() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("Database is connected!");
        console.log(`📡 Host: ${process.env.DB_HOST}`);
        console.log(`📡 Port: ${process.env.DB_PORT}`);
        console.log(`📂 Database: ${process.env.DB_DATABASE}`);
        console.log(`⏰ Server Time: ${res.rows[0].now}`);


    } catch (err) {
        console.error("Database connection failed.");
        console.error(err);

    }
}