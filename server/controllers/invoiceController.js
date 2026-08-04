import pool from "../db.js";

// POST /invoices
export const createInvoice = async (req, res) => {
const { 
    booking_id,
    room_charge,
    custom_charge_name,
    custom_charge,
    additional_pax,
    additional_pax_charge,
    services_charge,
    breakfast_package,
    subtotal,        // ← was sub_total
    discount,        // ← was discount_rate
    grandtotal,      // ← was grand_total
    payment_type,
    amount_paid,
    balance_due,     // ← was balance
    invoice_status
} = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

 const result = await client.query(
    `INSERT INTO invoices (
        booking_id, room_charge, custom_charge_name, custom_charge,
        additional_pax, additional_pax_charge, services_charge,
        breakfast_package, subtotal, discount, grandtotal,
        amount_paid, balance_due, invoice_status, is_void
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,FALSE)
    RETURNING *`,
    [
        booking_id, room_charge, custom_charge_name || null, custom_charge,
        additional_pax, additional_pax_charge, services_charge,
        breakfast_package || null, subtotal, discount, grandtotal,
        amount_paid, balance_due, invoice_status
    ]
);

        await client.query("COMMIT");

        res.status(201).json({
            message: "Invoice created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating invoice:", error);
        res.status(500).json({
            message: "Failed to create invoice",
            error: error.message
        });
    } finally {
        client.release();
    }
};


    // GET /invoices
    export const getAllInvoice = async (req, res) => {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT 
                    i.*,
                    b.check_in,
                    b.check_out,
                    b.booking_status,
                    r.room_number,
                    r.room_type,
                    g.name      AS guest_name,
                    g.email     AS guest_email,
                    g.phone     AS guest_phone
                FROM invoices i
                JOIN bookings b ON i.booking_id = b.id
                JOIN rooms    r ON b.room_id    = r.id
                JOIN guests   g ON b.guest_id   = g.id
                WHERE i.is_void = FALSE
                ORDER BY i.created_at DESC`
            );
            res.json(result.rows);   


        } catch (error) {
            console.error("Error in getAllInvoice:", error);
            res.status(500).json({ 
                message: "Failed to fetch invoices",
                error: error.message 
            });
        } finally {
            client.release();
        }
    };


// GET /invoices/:id
export const getInvoiceById = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT
                i.*,
                b.check_in,
                b.check_out,
                b.booking_status,
                r.room_number,
                r.room_type,
                g.name  AS guest_name,
                g.email AS guest_email,
                g.phone AS guest_phone
            FROM invoices i
            JOIN bookings b ON i.booking_id = b.id
            JOIN rooms    r ON b.room_id    = r.id
            JOIN guests   g ON b.guest_id   = g.id
            WHERE i.id = $1
            AND i.is_void = FALSE`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({
            message: "Invoice fetched successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({
            message: "Failed to fetch invoice",
            error: error.message
        });
    } finally {
        client.release();
    }
};


// PATCH /invoices/:id/status
export const updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { invoice_status, amount_paid} = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // block update if invoice is voided
        const check = await client.query(
            `SELECT is_void FROM invoices WHERE id = $1`,
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (check.rows[0].is_void) {
            return res.status(400).json({ message: "Cannot update a voided invoice" });
        }

        const result = await client.query(
            `UPDATE invoices
             SET 
            invoice_status = $1,
            amount_paid    = $2,
             balance_due    = grandtotal - $2
             WHERE id = $3
             RETURNING *`,
            [invoice_status, amount_paid, id]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Invoice status updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating invoice status:", error);
        res.status(500).json({
            message: "Failed to update invoice status",
            error: error.message
        });
    } finally {
        client.release();
    }
};


// PATCH /invoices/:id/void
export const voidInvoice = async (req, res) => {
    const { id } = req.params;
    const { void_reason } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // block if already voided
        const check = await client.query(
            `SELECT is_void FROM invoices WHERE id = $1`,
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (check.rows[0].is_void) {
            return res.status(400).json({ message: "Invoice is already voided" });
        }

        const result = await client.query(
            `UPDATE invoices
             SET
                is_void     = TRUE,
                void_reason = $1,
                voided_at   = NOW(),
                updated_at  = NOW()
             WHERE id = $2
             RETURNING *`,
            [void_reason || null, id]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Invoice voided successfully",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error voiding invoice:", error);
        res.status(500).json({
            message: "Failed to void invoice",
            error: error.message
        });
    } finally {
        client.release();
    }
};


// DELETE /invoices/:id
export const deleteInvoice = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `DELETE FROM invoices
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        await client.query("COMMIT");

        res.status(200).json({
            message: "Invoice deleted successfully",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error deleting invoice:", error);
        res.status(500).json({
            message: "Failed to delete invoice",
            error: error.message
        });
    } finally {
        client.release();
    }
};