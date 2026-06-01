import express from "express";
import dotenv from "dotenv";
import { getPayments } from "../controllers/paymentController.js";

const router = express.Router();

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.patch('/:id/status', updatePaymentStatus);
router.delete('/:id', deletePayment);


export default router;