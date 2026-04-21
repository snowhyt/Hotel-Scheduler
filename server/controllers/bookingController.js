import pool from "../db.js"
import moment from "moment";





//Create booking
export const createBooking = async (req, res) => {
    const { room_id, guest_name, guest_email, guest_phonenumber, check_in, check_out } = req.body;


    try {
        //this prevent from double booking
        const existing = pool.query(
            `SELECT * FROM bookings
            WHERE room_id = $1
            AND status IN ('pending', 'confirmed')
            AND check_in < $2 
            AND check_out > $3`,
            [room_id, check_out, check_in]
        );


        if ((await existing).rows.length > 0) {
            return res.status(400).json({ message: "Room already booked for these dates" });
        }

        const result = await pool.query(
            `INSERT INTO bookings (room_id, guest_name, guest_email, guest_phoneNumber, check_in, check_out )
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [room_id, guest_name, guest_email, guest_phonenumber, check_in, check_out]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });

    }
};



//Get all booking with filtering feature
export const getAllBooking = async (req, res) => {
    //check for double booking
    try {
        const { status, room_id, check_in, check_out } = req.query;

        //FIRST set compete to bookings that arent complete and cancelled
        const today = moment().format('YYYY-MM-DD');

        await pool.query(
            `UPDATE bookings
            SET status = 'completed'
            WHERE check_out < $1
            AND status NOT IN ('completed', 'cancelled')`,
            [today]
        )

        //THEN fetching all bookings with updated statuses
        let query = `
            SELECT 
                b.*,
                r.room_number,
                r.room_type,
                r.price
             FROM bookings b 
             JOIN rooms r ON b.room_id = r.id
             
            `;

        let conditions = [];
        let values = [];

        //filter by status
        if (status) {
            values.push(status);
            conditions.push(`b.status = $${values.length}`);
        }

        //filter by room
        if (room_id) {
            values.push(room_id);
            conditions.push(`b.room_id = $${values.length}`);
        }

        //filter by date range (overlapping)
        if (check_in && check_out) {
            values.push(check_out);
            values.push(check_in);
            conditions.push(`
                b.check_in < $${values.length - 1}
                AND b.check_out > $${values.length}`);
        }

        //combine conditions
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY b.id ";

        const result = await pool.query(query, values);
        res.json(result.rows);



    } catch (err) {
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

        if(result.rows.length === 0){
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
export const editBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_id, guest_name, guest_email, guest_phonenumber, check_in, check_out } = req.body;


        //CHECK EXISTING booking
        const existing = await pool.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [id]
        );

        if (existing.rowCount === 0) {
            return res.status(400).json({ message: "Booking not found" });
        }

        //prevent from double booking
        const conflict = await pool.query(
            `SELECT * FROM bookings
            WHERE room_id = $1
            AND id != $2
            AND status IN ('pending', 'confirmed')
            AND check_in < $3
            AND check_out > $4`,
            [room_id, id, check_out, check_in]
        );

        if (conflict.rows.length > 0) {
            return res.status(400).json({
                message: "Room already booked for these dates"
            });
        }

        const result = await pool.query(
            `UPDATE bookings
            SET room_id = $1,
            guest_name = $2,
            guest_email = $3,
            guest_phonenumber = $4,
            check_in = $5,
            check_out = $6
            WHERE id = $7
            RETURNING *`,
            [room_id, guest_name, guest_email, guest_phonenumber, check_in, check_out, id]
        );

        res.json({
            message: "Booking updated",
            booking: result.rows[0]
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }

}

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



