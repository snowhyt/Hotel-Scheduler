import express from "express";
import {createBooking, getAllBooking, updateBookingStatus, 
    getBookingsPerMonth, getMonthlyRevenue, getTopRooms, editBooking, deleteBooking, getBookingById, autoCompletePastBookings} from "../controllers/bookingController.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

//Post new booking
router.post("/",createBooking);


//GET all booking
router.get("/", getAllBooking);

//Booking per month
router.get("/per-month", getBookingsPerMonth);

//revenue per month
router.get("/revenue-per-month", getMonthlyRevenue);

//top rooms
router.get("/top-rooms", getTopRooms);


// GET booking by ID
router.get("/:id", getBookingById);

//PATCH update booking status
router.patch("/:id/status", updateBookingStatus);

//UPDATE / EDIT booking
router.put("/:id", editBooking );

//DELETE booking
router.delete("/:id", deleteBooking);


//auto-complete status
router.patch("/auto-complete", autoCompletePastBookings);








export default router;