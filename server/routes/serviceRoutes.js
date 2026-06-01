import express from "express";
import {
    getAllServices,
    getServiceByID,
    addService,
    deleteService,
    editService,
} from "../controllers/serviceController.js";

import upload from "../middlewares/upload.js";


const router = express.Router();


router.get("/", getAllServices);
router.get("/:id", getServiceByID);
router.post("/", addService);
router.delete("/:id", deleteService);
router.patch("/edit/:id", editService);


export default router;