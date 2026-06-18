import express from "express";
import dotenv from "dotenv";
import { getAllPayment, getPaymentById, createPayment, deletePayment } from "../controllers/paymentController.js";

const router = express.Router();



router.get('/', getAllPayment);
router.get('/:id', getPaymentById);
router.post('/', createPayment);

router.delete('/:id', deletePayment);


export default router;