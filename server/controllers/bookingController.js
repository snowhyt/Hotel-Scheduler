import pool from "../db.js"
import moment from "moment";



//new create booking -------------------------------------------------------------
export const createBooking = async (req,res) => {
    const client = await pool.connect();
    const {
        room_id, name, email, phone, address, total_pax, check_in, check_out,
        invoice, payment, action, paymentType, paymentValue, subTotal, requiredDeposit, booking_status
    } = req.body;

    // Ensure name, phone, check_in, check_out are not null/undefined for initial validation
    if (!name || !phone || !check_in || !check_out || !room_id) {
        return res.status(400).json({ message: "Missing required booking information." });
    }
    try {
        //start 
        await client.query("BEGIN");
        
        //validation: check for double booking
        const existing = await client.query(`
            SELECT * FROM bookings
            WHERE room_id = $1
            AND booking_status IN ('pending', 'confirmed')
            AND check_in < $2
            AND check_out > $3`,
            [room_id, check_out, check_in]
            );
            if (existing.rows.length > 0) {
                await client.query("ROLLBACK");
                client.release();
                return res.status(400).json({message: "Room already booked for these dates"});
            }



            //Validation: check if guest already exists
            let guest_id;

            const guestCheck = await client.query(
                `SELECT id FROM guests WHERE name = $1 AND phone = $2`,
                [name, phone]
            );
            if(guestCheck.rows.length > 0)
            {
                guest_id = guestCheck.rows[0].id;
            } else {
            //insert new guest if existing not found
                const newGuest = await client.query(`
                    INSERT INTO guests (name, email, phone, address)
                    VALUES ($1, $2, $3, $4) RETURNING id
                    `, [name, email || null, phone, address || null]);

                guest_id = newGuest.rows[0].id;
            }



            //Insert booking data
            const bookingResult = await client.query(
                `INSERT INTO bookings (room_id, guest_id, check_in, check_out, total_pax, booking_status)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [room_id, guest_id, check_in, check_out, total_pax, booking_status || (action === "paylater" ? "pending" : "confirmed")]
            );

            //get booking data in frontend
            const booking = bookingResult.rows[0];

            const invoiceNumGenerator = () => {
                const now = new Date();

                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");

                const hours = String(now.getHours()).padStart(2, "0");
                const minutes = String(now.getMinutes()).padStart(2, "0");
                const seconds = String(now.getSeconds()).padStart(2, "0");

                return `INV-${year}${month}${day}-${hours}${minutes}${seconds}`;
                };

            // Insert invoice data (only if provided by the client)
            if (invoice) {
                const invoiceResult = await client.query(
                `INSERT INTO invoices (
                    booking_id, room_charge, custom_charge_name, custom_charge,
                    additional_pax, additional_pax_charge, services_charge,
                    breakfast_package, subtotal, discount, grandtotal,
                     amount_paid, invoice_status, is_void, invoice_number
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id`,
                [
                    booking.id,
                    invoice.room_charge,
                    invoice.custom_charge_name,
                    invoice.custom_charge,
                    invoice.additional_pax,
                    invoice.additional_pax_charge,
                    invoice.services_charge,
                    invoice.breakfast_package,
                    invoice.subtotal,
                    invoice.discount,
                    invoice.grandtotal,
                    invoice.amount_paid,
                    invoice.invoice_status,
                    false,
                    invoiceNumGenerator()
                ]
            );
            const invoice_id = invoiceResult.rows[0].id;
            // Update booking with invoice_id
            await client.query(
                `UPDATE bookings SET invoice_id = $1 WHERE id = $2`,
                [invoice_id, booking.id]
            );

            // Insert payment data if action is 'paynow' or 'paylater' with initial payment
            }
            if (payment && (action === "paynow" || action === "paylater")) {
                await client.query(
                    `INSERT INTO payments (
                        booking_id, amount, payment_method, reference_number,
                        payment_date, notes, payment_type, payment_status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [
                        booking.id,
                        payment.amount,
                        payment.payment_method,
                        payment.reference_number,
                        payment.payment_date,
                        payment.notes,
                        payment.payment_type,
                        payment.payment_status
                    ]
                );
            }


          await client.query("COMMIT");
          client.release();

          res.json({
            ...booking,
          });



    } catch (error) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error in createBooking:", error);
        res.status(500).json({error: error.message});
    }



};


//get all bookings
export const getAllBooking = async (req, res) => {
    try {
        const {room_id, check_in, check_out, booking_status, total_pax } = req.query;

        let query = `
            SELECT 
                b.*,
                r.room_number,
                r.room_type,
                r.price,
                g.name as name,
                g.email as email,
                g.phone as phone,
                i.id as invoice_id,
                i.amount_paid,
                i.invoice_status,
                i.grandtotal
               
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN invoices i ON b.invoice_id = i.id
            WHERE 1=1
        `;

        let values = [];

        if (booking_status) {
            values.push(booking_status);
            query += ` AND b.booking_status = $${values.length}`;
        }

        if (room_id) {
            values.push(room_id);
            query += ` AND b.room_id = $${values.length}`;
        }

        if (check_in && check_out) {
            values.push(check_out);
            values.push(check_in);
            query += ` AND b.check_in < $${values.length - 1} AND b.check_out > $${values.length}`;
        }

        query += " ORDER BY b.id DESC";

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in getAllBooking:", err);
        res.status(500).json({ error: err.message });
    }
};

//get booking by ID
export const getBookingByID = async (req, res) => {

    try {
        const { id } = req.params;

        // Auto-complete if this specific booking is past
        const today = moment().format('YYYY-MM-DD');
        await pool.query(
            `UPDATE bookings 
       SET booking_status = 'completed' 
       WHERE id = $1 
       AND check_out < $2 
       AND booking_status NOT IN ('completed', 'cancelled')`,
        [id, today]
        )

        const result = await pool.query(
            ` SELECT 
                b.*,
                r.room_number,
                r.room_type,
                r.price
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id 
            WHERE b.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }


}

//edit booking
export const editBooking = async (req, res) => {
    const { id } = req.params;

    const { name, email, phone, room_id, check_in, check_out,
        booking_status, grandtotal, amount_paid, balance, total_pax
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        //update booking
        const bookingRes = await client.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [id]
        );
        if (bookingRes.rows.length === 0) {
            throw new Error("Booking not found");
        }
        const booking = bookingRes.rows[0];

        //update guest
        await client.query(`
                UPDATE guests
                SET name = $1,
                email = $2,
                phone = $3
                WHERE id = $4
            `, [name, email, phone, booking.guest_id]
        );

        //update booking
        await client.query(
            `UPDATE bookings
                SET room_id = $1,
                check_in = $2,
                check_out = $3,
                booking_status = $4,
                total_pax = $5
                WHERE id = $6
                `,
            [room_id, check_in, check_out, booking_status, total_pax, id]

        );

        //update invoice
        await client.query(
            `UPDATE invoices
                SET grandtotal = $1,
                amount_paid = $2,
                balance = $3
                WHERE booking_id = $4
                `,
            [grandtotal, amount_paid, balance, id]
        );

        await client.query("COMMIT");

        res.json({ message: "Booking updated successfully" });


    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: err.message })
    } finally {
        client.release();
    }
};






    //Patch booking status
    export const updateBookingStatus = async (req, res) => {

        try {
            const { id } = req.params;
            const { booking_status } = req.body;

            //validate allowed staus values
            const validStatus = ["pending", "confirmed", "cancelled", "completed"];

            if (!validStatus.includes(booking_status)) {
                return res.status(400).json(
                    {
                        message: "Invalid Status Value"
                    }
                );
            }

            const result = await pool.query(
                `UPDATE bookings SET booking_status = $1 WHERE id = $2 RETURNING *`,
                [booking_status, id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Booking not found" });
            }

            res.json({
                message: "Booking status updated",
                booking: result.rows[0]
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

//delete

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM bookings WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        res.json({
            message: "Booking deleted successfully",
            booking: result.rows[0]
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }


};


//bookings per month
export const getBookingsPerMonth = async (req, res) => {
    try {

        // First auto-complete past bookings
        const today = moment().format('YYYY-MM-DD');
        await pool.query(
            `UPDATE bookings 
       SET booking_status = 'completed' 
       WHERE check_out < $1 
       AND booking_status NOT IN ('completed', 'cancelled')`,
            [today]
        );

        // Then get the monthly stats

        const result = await pool.query(
            `SELECT
                EXTRACT(MONTH FROM check_in) AS month_num,
                COUNT(*) FILTER (WHERE booking_status = 'confirmed') AS confirmed,
                COUNT(*) FILTER (WHERE booking_status = 'cancelled') AS cancelled,
                COUNT(*) AS total
                FROM bookings
                GROUP BY month_num
                ORDER BY month_num
                `
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });

    }
};

//revenue per month
export const getMonthlyRevenue = async (req, res) => {
    try {

        // First auto-complete past bookings
        const today = moment().format('YYYY-MM-DD');
        await pool.query(
       `UPDATE bookings 
       SET booking_status = 'completed' 
       WHERE check_out < $1 
       AND booking_status NOT IN ('completed', 'cancelled')`,
            [today]
        );

   

        const result = await pool.query(`
            SELECT
            TO_CHAR(b.check_in, 'YYYY-MM') AS month,
            COALESCE(SUM(i.grandtotal), 0) AS revenue
            FROM bookings b
            LEFT JOIN invoices i ON i.booking_id= b.id
            WHERE b.booking_status = 'completed'
            AND EXTRACT(YEAR FROM b.check_in) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY TO_CHAR(b.check_in, 'YYYY-MM')
            ORDER BY TO_CHAR(b.check_in, 'YYYY-MM')

    `);


        //    SELECT
        //             TO_CHAR(b.check_in, 'YYYY-MM') AS month,
        //             SUM(i.grandtotal) AS revenue
        //         FROM bookings b
        //         JOIN invoices i ON b.invoice_id = i.id

        //         GROUP BY month
        //         ORDER BY month

        res.json(result.rows);
    } catch (err) {
        res.json({ error: err.message });
    }
};

//get top rooms in month
export const getTopRooms = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                r.room_number,
                COUNT (*) AS total_bookings
                FROM bookings b
                JOIN rooms r ON b.room_id = r.id
                GROUP BY r.room_number
                ORDER BY total_bookings DESC
                LIMIT 5`
        );
        res.json(result.rows);


    } catch (err) {
        res.status(500).json({ error: err.message });

    }
};

// Auto-complete all past bookings (can be called by a cron job)
export const autoCompletePastBookings = async (req, res) => {
    try {

        res.json({
            message: `Auto-completed ${result.rows.length} past bookings`,
            updatedCount: result.rows.length,
            updatedBookings: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
