import express from "express";
import {
    getRooms,
    addRooms,
    getAvailableRooms,
} from "../controllers/roomController.js";

const router = express.Router();


router.get("/", getRooms);
router.post("/", addRooms);
router.get("/available", getAvailableRooms);

export default router;