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
    //multer for image upload
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: "Request body is empty. Ensure you are using Multer middleware on this route." 
      });
    }

    const { room_number, room_type, price, description, room_capacity} = req.body;
    const image = req.file ? req.file.filename : null;


    const result = await pool.query(
      "INSERT INTO rooms (room_number, room_type, price, description, image_url, room_capacity) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [room_number, room_type, price, description, image, room_capacity]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
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

export const deleteRoom = async (req,res) => {

  try {
    const {id} =req.params;

    //check if there are sched bookings in selected room
    const check = await pool.query(
      `SELECT * FROM rooms WHERE id = $1
      AND status IN ('pending', 'confirmed')`,
      [id]
    );

    if (check.rowCount > 0){
        return res.status(400).json({
          message: "Cannot delete room with active bookings"
        });
    }

    //delete room
    const result = await pool.query(
      `DELETE FROM rooms WHERE id = $1 RETURNING *`,
      [id]
    );

    if(result.rowCount === 0)
    {
      return res.status(404).json({
        message: "Room not found"
      });
    }
    res.json({
      message: "Room deleted successfully",
      room: result.rows[0]
    });
    
  } catch (err) {
    res.status(400).json({error: err.message});
  
  }

};

export const editRoom =async (req,res) => {
  try {
    const {id} =req.params;
    const {room_number, room_type, price, description, room_capacity} =req.body;
    const image = req.file ? req.file.filename : null;

    //check existing room
    const existing = await pool.query(
      `SELECT * FROM rooms WHERE id = $1`,
      [id]
    
    );

    if(existing.rowCount === 0){
      return res.status(400).json({message: "Room not found"});
    }

    const result = await pool.query(
      `UPDATE rooms 
      SET room_number = $1,
      room_type = $2,
      price = $3,
      description = $4,
      image_url = $5,
      room_capacity = $6
      WHERE id = $7
      RETURNING *`,
      [room_number, room_type, price, description, image, room_capacity, id]
    );

    res.json({
      message: "Room updated successfully",
      room: result.rows[0]
    });
    
  } catch (err) {
    res.status(400).json({error: err.message});
  
  }
};