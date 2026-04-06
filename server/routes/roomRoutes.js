import express from "express";
import {
    getRooms,
    addRooms,
    getAvailableRooms,
    deleteRoom,
    editRoom,
} from "../controllers/roomController.js";

import upload from "../middlewares/upload.js";


const router = express.Router();


router.get("/", getRooms);
router.get("/available", getAvailableRooms);
router.post("/", upload.single("image"), addRooms);
router.delete("/:id", deleteRoom);
router.patch("edit/:id", editRoom);


export default router;