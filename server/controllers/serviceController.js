import pool from "../db.js";

// create a service
export const addService = async (req, res) => {
    const client = await pool.connect(); // added await here
    const { name, price, service_type, is_active } = req.body;

    try {
        await client.query("BEGIN");

        if (!name || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Added await here!
        const serviceResult = await client.query(
            `INSERT INTO services (name, price, service_type, is_active)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, price, service_type, is_active]
        );

        const service = serviceResult.rows[0];

        await client.query("COMMIT");
        res.json(service);

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error in addService:", error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release(); // Move to finally block to ensure release even on error
    }
};

// get all services
export const getAllServices = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const serviceResult = await client.query(`SELECT * FROM services`);
        res.json(serviceResult.rows);
    } catch (error) {
        console.error("Error in getAllServices:", error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// get service by ID
export const getServiceByID = async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        // Added await here!
        const serviceResult = await client.query(
            `SELECT * FROM services WHERE id = $1`,
            [id]
        );
        res.json(serviceResult.rows[0]);
    } catch (error) {
        console.error("Error in getServiceByID:", error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// delete service
export const deleteService = async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        await client.query("BEGIN");

        // Added await here!
        const deleteResult = await client.query(
            `DELETE FROM services WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: "Service not found" });
        }
        
        await client.query("COMMIT");
        res.json({
            message: "Service deleted successfully",
            service: deleteResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error in deleteService:", error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// edit service
export const editService = async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { name, price, service_type, is_active } = req.body;

    try {
        await client.query("BEGIN");
        
        const existing = await client.query(
            `SELECT * FROM services WHERE id = $1`,
            [id]
        );

        if (existing.rowCount === 0) {
            return res.status(404).json({ message: "Service not found" }); // Fixed from Room
        }

        // Added await here!
        const result = await client.query(`
            UPDATE services
            SET name = $1, price = $2, service_type = $3, is_active = $4
            WHERE id = $5
            RETURNING *
        `, [name, price, service_type, is_active, id]);

        await client.query("COMMIT"); // Was missing!

        res.json({
            message: "Service updated successfully",
            service: result.rows[0] // Fixed from room: result.rows[0]
        });
            
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error in editService:", error); // Fixed error variable reference
        res.status(400).json({ error: error.message });
    } finally {
        client.release(); // Was missing!
    }
};