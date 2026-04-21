import pool from "../db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE CURRENT_DATE >= check_in::DATE AND CURRENT_DATE < check_out::DATE AND status IN ('confirmed', 'pending')) AS inhouse,
        COUNT(*) FILTER (WHERE check_in::DATE != CURRENT_DATE AND check_IN::DATE > CURRENT_DATE AND status IN ('confirmed', 'pending')) AS expectedarrivals,
        COUNT(*) FILTER (WHERE check_out::DATE = CURRENT_DATE AND status IN ('confirmed', 'pending')) AS expecteddepartures
      FROM bookings
    `);

    const stats = result.rows[0];
      let endOfDay = Number(stats.inhouse) - Number(stats.expecteddepartures);
      if (endOfDay <= 0){
        endOfDay = 0;
      }
    console.log("Dashboard stats:", stats); // Debug log

    res.json({
      total: Number(stats.total) || 0,
      confirmed: Number(stats.confirmed) || 0,
      pending: Number(stats.pending) || 0,
      cancelled: Number(stats.cancelled) || 0,
      completed: Number(stats.completed) || 0,
      inHouse: Number(stats.inhouse) || 0,
      expectedArrivals: Number(stats.expectedarrivals) || 0,
      expectedDepartures: Number(stats.expecteddepartures) || 0,
      endOfDay: endOfDay || 0,
    });

  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: err.message });
  }
};