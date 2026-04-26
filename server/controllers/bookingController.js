import pool from "../db.js"
import moment from "moment";



// Create booking
export const createBooking = async (req, res) => {
    const { room_id, name, email, phone, total_pax, check_in, check_out, amount_paid } = req.body;
    const client = await pool.connect();
    
    const invoice_number = `INV-${new Date().getFullYear()}-${Date.now()}`;

    

    try {
        // Start transaction
        await client.query("BEGIN");

        // Check for double booking
        const existing = await client.query(
            `SELECT * FROM bookings
            WHERE room_id = $1
            AND status IN ('pending', 'confirmed')
            AND check_in < $2 
            AND check_out > $3`,
            [room_id, check_out, check_in]
        );

        if (existing.rows.length > 0) {
            await client.query("ROLLBACK");
            client.release();
            return res.status(400).json({ message: "Room already booked for these dates" });
        }

        // Check if guest already exists
        let guest_id;

        const guestCheck = await client.query(
            `SELECT id FROM guests WHERE name = $1 AND phone = $2`,
            [name, phone]
        );

        if (guestCheck.rows.length > 0) {
            guest_id = guestCheck.rows[0].id;
        } else {
            // Insert new guest
            const newGuest = await client.query(
                `INSERT INTO guests (name, email, phone)
                VALUES ($1, $2, $3) RETURNING id`,
                [name, email, phone]
            );
            guest_id = newGuest.rows[0].id;
        }

        // Insert booking data - FIXED: removed extra 'status' parameter
        const bookingResult = await client.query(
            `INSERT INTO bookings (room_id, guest_id, check_in, check_out, status, total_pax)
            VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
            [room_id, guest_id, check_in, check_out, total_pax] // Fixed: removed extra 'status'
        );

        const booking = bookingResult.rows[0];


        //get room price
        const roomResult = await client.query(
            `SELECT price FROM rooms WHERE id = $1`,
            [room_id]
        );
        const price = roomResult.rows[0].price;
        const nights = Math.ceil((check_out - check_in) / (1000 * 60 * 60 * 24));
        const subtotal = nights * price;
        const tax = 0.1;
        const additional_charges = 0;
        const balance_due = subtotal * (1 + tax) + additional_charges;
        const total_amount = balance_due + amount_paid;




        // Insert invoice data
        const invoiceResult = await client.query(
            `INSERT INTO invoices (booking_id, amount_paid, status, invoice_number, 
            subtotal, total_amount, balance_due, tax, additional_charges)
            VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8) RETURNING id`,
            [booking.id, amount_paid || 0, invoice_number, subtotal, total_amount, balance_due, tax, additional_charges]
        );
        const invoice_id = invoiceResult.rows[0].id;



        // Link invoice to booking
        await client.query(
            `UPDATE bookings 
            SET invoice_id = $1
            WHERE id = $2`,
            [invoice_id, booking.id]
        );

        await client.query("COMMIT");
        client.release();

        res.json({
            ...booking,
            invoice_id
        });

    } catch (err) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error in createBooking:", err);
        res.status(500).json({ error: err.message });
    }
};

// //Create booking
// export const createBooking = async (req, res) => {
//     const { room_id, name, email, phone, total_pax, status, check_in, check_out, amount_paid } = req.body;
//     const client = await pool.connect();

//     try {
//             // AND guest_id = $2
//             // AND status IN ('pending', 'confirmed')
//         //this prevent from double booking
//         const existing = await client.query(
//             `SELECT * FROM bookings
//             WHERE room_id = $1
//             AND status In ('pending', 'confirmed')
//             AND check_in < $2 
//             AND check_out > $3`,
//             [room_id, check_out, check_in]
//         );


//         if ((await existing).rows.length > 0) {
//             await  client.query("ROLLBACK");
//             return res.status(400).json({ message: "Room already booked for these dates" });
//         }
//         //check if guest already exist
//         let guest_id;

//         const guestCheck = await client.query(
//             `SELECT id FROM guests WHERE name = $1 and phone = $2`,
//             [name, phone]
//         );

//         if(guestCheck.rows.length > 0){
//             guest_id = guestCheck.rows[0].id;
//         } else {
//             //insert guest data
//             const newGuest = await client.query(
//                 `INSERT INTO guests (name, email, phone)
//                 VALUES ($1, $2, $3) RETURNING id
//                 `,
//                 [name, email, phone]
//             );
//             guest_id = newGuest.rows[0].id;
//         }

//         //insert booking data
//         const bookingResult = await client.query(
//             `INSERT INTO bookings (room_id, guest_id, check_in, check_out, status, total_pax)
//             VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
//             [room_id, guest_id, check_in, check_out, status, totalPax]
//         );

//         const booking = bookingResult.rows[0];

//         //insert invoice data

//         const invoiceResult = await client.query(
//             `INSERT INTO invoices (booking_id, amount_paid)
//             VALUES ($1, $2) RETURNING id`,
//             [booking.id, amount_paid || 0]
//         );
//         const invoice_id = invoiceResult.rows[0].id;

//         //link invoice to booking
//         await client.query(
//             `
//             UPDATE bookings 
//             SET invoice_id = $1
//             WHERE id = $2
//             `,
//             [invoice_id, booking.id]
//         );

//         await client.query("COMMIT");

//         res.json({
//             ...booking,
//             invoice_id
//         });

//     } catch (err) {
//         await client.query("ROLLBACK");
//         res.status(500).json({ error: err.message });

//     }
// };



// //Get all booking with filtering feature
// export const getAllBooking = async (req, res) => {
//     //check for double booking
//     try {
//         const { status, room_id, guest_id, invoice_id, check_in, check_out } = req.query;

//         //FIRST set compete to bookings that arent complete and cancelled
//         const today = moment().format('YYYY-MM-DD');

//         await pool.query(
//             `UPDATE bookings
//             SET status = 'completed'
//             WHERE check_out < $1
//             AND status NOT IN ('completed', 'cancelled')`,
//             [today]
//         )

//         //THEN fetching all bookings with updated statuses
//         let query = `
//             SELECT 
//                 b.*,
//                 r.room_number,
//                 r.room_type,
//                 r.price,
//                 i.amount_paid,
//                 g.name,
//                 g.email,
//                 g.phone
//             FROM bookings b 
//             JOIN rooms r ON b.room_id = r.id
//             JOIN guests g ON b.guest_id = g.id
//             LEFT JOIN invoices i ON b.invoice_id = i.id
             
//             `;

//         let conditions = [];
//         let values = [];

//         //filter by status
//         if (status) {
//             values.push(status);
//             conditions.push(`b.status = $${values.length}`);
//         }

//         //filter by room
//         if (room_id) {
//             values.push(room_id);
//             conditions.push(`b.room_id = $${values.length}`);
//         }

//         //filter by date range (overlapping)
//         if (check_in && check_out) {
//             values.push(check_out);
//             values.push(check_in);
//             conditions.push(`
//                 b.check_in < $${values.length - 1}
//                 AND b.check_out > $${values.length}`);
//         }

//         // filter by guest
//         if (guest_id) {
//             values.push(guest_id);
//             conditions.push(`b.guest_id = $${values.length}`);
//         }

//         // filter by invoice
//         if (invoice_id) {
//             values.push(invoice_id);
//             conditions.push(`b.invoice_id = $${values.length}`);
//         }

//         //combine conditions
//         if (conditions.length > 0) {
//             query += " WHERE " + conditions.join(" AND ");
//         }
//         query += " ORDER BY b.id ";

//         const result = await pool.query(query, values);
//         res.json(result.rows);



//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };


export const getAllBooking = async (req, res) => {
    try {
        const { status, room_id, check_in, check_out } = req.query;

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
                i.balance_due,
                i.status as invoice_status
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN invoices i ON b.invoice_id = i.id
            WHERE 1=1
        `;

        let values = [];

        if (status) {
            values.push(status);
            query += ` AND b.status = $${values.length}`;
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
       SET status = 'completed' 
       WHERE id = $1 
       AND check_out < $2 
       AND status NOT IN ('completed', 'cancelled')`,
            [id, today]
        );



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
//Update or Edit Booking Details
// export const editBooking = async (req, res) => {
//         const { id } = req.params;
//         const { room_id, name, email, phone, total_pax,
//              check_in, check_out,status, amount_paid  } = req.body;
        
//         const client = await pool.connect();

//     try {
//         // Start transaction
//         await client.query("BEGIN");


//         //CHECK EXISTING booking
//         const existing = await client.query(
//             `SELECT * FROM bookings WHERE id = $1`,
//             [id]
//         );

//         if (existing.row.length === 0) {
//             throw new Error("Booking not found");
//         }

//         const booking = existing.rows[0];

//         //update guest
//         await client.query(
//             `UPDATE guests
//             SET name = $1,
//             email = $2,
//             phone = $3
//             WHERE id = $4
//             `,
//             [name, email, phone, booking.guest_id]

//         );

//         //update booking
//         await client.query(
//             `UPDATE bookings
//             SET room_id = $1,
//             check_in = $2,
//             check_out = $3,
//             total_pax = $4,
//             status = $5
//             WHERE id = $6
//             `,
//             [room_id, check_in, check_out, total_pax, status, id]
//         );

//         //update invoice
//         await client.query(
//             `UPDATE invoices
//             SET total_amount = $1,
//             amount_paid = $2,
//             balance_due = $3,
//             WHERE id = $4
//             `,
//             [total_amount, amount_paid, balance_due, booking.invoice_id]
//         );

//         await client.query("COMMIT");
//         res.json({message: 'Booking updated successfully'});

        




//         //prevent from double booking
//         const conflict = await client.query(
//             `SELECT * FROM bookings
//             WHERE room_id = $1
//             AND id != $2
//             AND status IN ('pending', 'confirmed')
//             AND check_in < $3
//             AND check_out > $4`,
//             [room_id, id, check_out, check_in]
//         );

//         if (conflict.rows.length > 0) {
//             return res.status(400).json({
//                 message: "Room already booked for these dates"
//             });
//         }


//         const guestCheck = await client.query(
//             `SELECT id FROM guests WHERE name = $1
//             AND phone = $2`,
//             [name, phone]
//         );
//         if (guestCheck.rows.length === 0) {
//             throw new Error("Guest not found");
//         }

//         const updateGuest = await client.query(
//             `UPDATE guests
//             SET name = $1,
//             email = $2,
//             phone = $3,
//             WHERE id = $4,
//             RETURNING *`,
//             [name, email, phone, guestCheck.rows[0].id]
//         );
//         const guest = updateGuest.rows[0];

        
        
//         const updateBooking = await client.query(
//             `UPDATE bookings
//             SET room_id = $1,
//             guest_id = $2,
//             check_in = $3,
//             check_out = $4,
//             total_pax = $5,
//             status = $6,
//             WHERE id = $7,
//             RETURNING *`,
//             [room_id, guestCheck.rows[0].id, check_in, check_out, total_pax, status, id]
//         );
//         const booking = updateBooking.rows[0];

       


//         const updateRoom = await client.query(
//             `UPDATE rooms
//             SET room_number = $1,
//             room_type = $2,
//             price = $3,
//             WHERE id = $4,
//             RETURNING *`,
//             [room_number, room_type, price, room_id]
//         );
//         const room = updateRoom.rows[0];


        
//         const price = roomResult.rows[0].price;
//         const nights = Math.ceil((new Date(check_out) - new Date(check_in)) 
//         / (1000 * 60 * 60 * 24));
//         const tax = 0.1;
//         const additional_charges = 0;
//         const balance_due = subtotal * (1 + tax) + additional_charges;
//         const total_amount = balance_due + amount_paid;

//         const updateInvoice = await client.query(
//             `UPDATE invoices
//             SET amount_paid = $1,
//             subtotal = $2,
//             total_amount = $3,
//             balance_due = $4,
//             additional_charges = $5,
//             tax = $6,
//             WHERE id = $7,
//             RETURNING *`,
//             [amount_paid, subtotal, total_amount, balance_due, additional_charges, tax, id]
//         );
//          const invoice_id = updateInvoice.rows[0].id;

//         await client.query("COMMIT");
//         client.release();

//         res.json({
//             ...booking,
//             ...guest,
//             ...room,
//             invoice_id
//         });

    



//         // const result = await pool.query(
//         //     `UPDATE bookings
//         //     SET room_id = $1,
//         //     guest_name = $2,
//         //     guest_email = $3,
//         //     guest_phone = $4,
//         //     check_in = $5,
//         //     check_out = $6
//         //     WHERE id = $7
//         //     RETURNING *`,
//         //     [room_id, guest_name, guest_email, guest_phone, check_in, check_out, id]
//         // );

//         // res.json({
//         //     message: "Booking updated",
//         //     booking: result.rows[0]
//         // });

//     } catch (err) {
//         await client.query("ROLLBACK");
//         client.release();
//         console.error("Error in editBooking:", err);
//         res.status(400).json({ error: err.message });
//     }

// }


export const editBooking = async (req, res) => {
        const { id } = req.params;

        const { name, email, phone, room_id, check_in, check_out,
            status,total_amount, amount_paid, balance_due, total_pax
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
                status = $4,
                total_pax = $5
                WHERE id = $6
                `,
                [room_id, check_in, check_out, status, total_pax, id]
            
            );

            //update invoice
            await client.query(
                `UPDATE invoices
                SET total_amount = $1,
                amount_paid = $2,
                balance_due = $3
                WHERE booking_id = $4
                `,
                [total_amount, amount_paid, balance_due, booking.invoice_id]
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
        const { status } = req.body;

        //validate allowed staus values
        const validStatus = ["pending", "confirmed", "cancelled", "completed"];

        if (!validStatus.includes(status)) {
            return res.status(400).json(
                {
                    message: "Invalid Status Value"
                }
            );
        }

        const result = await pool.query(
            `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
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
       SET status = 'completed' 
       WHERE check_out < $1 
       AND status NOT IN ('completed', 'cancelled')`,
            [today]
        );

        // Then get the monthly stats

        const result = await pool.query(
            `SELECT
                EXTRACT(MONTH FROM check_in) AS month_num,
                COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
                COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
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
       SET status = 'completed' 
       WHERE check_out < $1 
       AND status NOT IN ('completed', 'cancelled')`,
            [today]
        );

        // Then get revenue stats

        const result = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM check_in) AS month,
                SUM(
                (b.check_out - b.check_in) * r.price
                ) AS revenue
                 FROM bookings b
                 JOIN rooms r ON b.room_id = r.id
                 WHERE b.status = 'completed'
                 GROUP BY month
                 ORDER BY month
            `)

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



