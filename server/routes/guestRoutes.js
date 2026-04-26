import express from "express";
import dotenv from "dotenv";
import { getAllGuest, getGuestById, createGuest, updateGuest, deleteGuest } 
from "../controllers/guestController.js";

const router = express.Router();



//get all guest
router.get('/', getAllGuest);

//get guest by ID
router.get('/:id', getGuestById);

//create guest
router.post('/', createGuest);

//update guest
router.put('/:id', updateGuest);

//delete guest
router.delete('/:id', deleteGuest);







export default router;