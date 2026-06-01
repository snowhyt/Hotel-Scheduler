import express from 'express';
import dotenv from 'dotenv';
import { getAllInvoice, getInvoiceById, createInvoice, 
    updateInvoiceStatus, voidInvoice, deleteInvoice } from '../controllers/invoiceController.js';


const router = express.Router();

router.get('/', getAllInvoice);

router.get(/:id/, getInvoiceById);

router.post('/', createInvoice);

router.patch('/:id/status', updateInvoiceStatus);

router.patch('/:id/void', voidInvoice);

router.delete('/:id', deleteInvoice);

export default router;