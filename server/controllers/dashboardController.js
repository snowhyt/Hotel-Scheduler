import pool from "../db.js";

export const getDashboardStats = async (req,res) => {
    try {
       const result = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM bookings
    `);

    const stats = result.rows[0];

    res.json({
      total: Number(stats.total),
      confirmed: Number(stats.confirmed),
      pending: Number(stats.pending),
      cancelled: Number(stats.cancelled),
      completed: Number(stats.completed)
    });


    } catch (err) {
        res.status(400).json({error: err.message});
    }
}