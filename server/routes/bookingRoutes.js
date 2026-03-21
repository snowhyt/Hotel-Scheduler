import express from "express";
import {createBooking, getAllBooking, updateBookingStatus, editBooking, deleteBooking, getBookingByID} from "../controllers/bookingController.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

//Post new booking
router.post("/",createBooking);


//GET all booking
router.get("/", getAllBooking);


// GET booking by ID
router.get("/:id", getBookingByID);

//PATCH update booking status
router.patch("/:id/status", updateBookingStatus);

//UPDATE / EDIT booking
router.put("/:id", editBooking );

//DELETE booking
router.delete("/:id", deleteBooking);

export default router;