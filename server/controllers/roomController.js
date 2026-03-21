import pool from "../db.js";

export const getRooms = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rooms ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addRooms = async (req, res) => {
  try {
    const { room_number, room_type, price } = req.body;

    const result = await pool.query(
      "INSERT INTO rooms (room_number, room_type, price) VALUES ($1,$2,$3) RETURNING *",
      [room_number, room_type, price]
    );

    console.log(req.body);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailableRooms = async (req,res) => {
  try {
    const {check_in, check_out} = req.query;

    if(!check_in || !check_out){
      return res.status(400).json({
        message: "check_in and check_out are required"
      });
    }

    const result = await pool.query(
      `SELECT * FROM rooms
      WHERE id NOT IN (
        SELECT room_id FROM bookings
        WHERE status IN ('pending', 'confirmed')
        AND check_in < $2
        AND check_out > $1 
        )`,
        [check_in, check_out]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({error: err.message});
    
  }
};