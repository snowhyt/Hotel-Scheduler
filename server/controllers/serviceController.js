import pool from "../db.js"
import moment from "moment";


//create a service
export const addService = async (req, res) => {
const client = pool.connect();
const {name, price} = req.body;

try {
    await client.query("BEGIN");

    //validation: empty
    if(!name || !price){
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const serviceResult = client.query
    (`
        INSERT INTO services (name, price)
        VALUES ($1, $2) RETURNING *
    `,
    [name, price])

    const service = serviceResult.rows[0];

    await client.query("COMMIT");
    await client.release();

    res.json(service);


} catch (error) {
    await client.query("ROLLBACK");
    await client.release();
    console.error("Error in addService:", error)
    res.status(500).json({error: error.message});
   
}

}


//get all services
export const getAllServices = async (req, res) => {
    const client = await pool.connect();
    const {name, price} = req.query;

    try {
        await client.query("BEGIN");

        const serviceResult = await client.query(
            `SELECT * FROM services`
        );

       await client.query("COMMIT");
       await client.release();
        const result = serviceResult.rows;
        res.json(result);

    } catch (error) {
        console.error("Error in getAllServices:", error);
        res.status(500).json({error: error.message});
    }
}


export const getServiceByID = async (req, res) => {
    const client = await pool.connect();
    const {id} = req.params;

    try {
        await client.query("BEGIN");

        const serviceResult = client.query(
            `SELECT * FROM services WHERE id = $1`,
            [id]
        );
        await client.query("COMMIT");
        await client.release();
        res.json(serviceResult.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        await client.release();
        console.error("Error in getServiceByID:", error);
        res.status(500).json({error: error.message})
    }
}




export const deleteService = async (req, res) => {
    const client = await pool.connect();
    const {id} = req.params;

    try {
        await client.query("BEGIN");

        //validation
        const serviceCheck = await client.query(
            `SELECT * FROM services WHERE id = $1`,
            [id])

        //delete
        const deleteResult = client.query(
            `DELETE FROM services WHERE id = $1 RETURNING *`,
            [id]
        )
        await client.query("COMMIT");
        await client.release();
        res.json({
            message: "Service deleted successfully",
            service: deleteResult.rows[0]
        });

    
    } catch (error) {
        console.error("Error in deleteService:", error);
        res.status(500).json({error: error.message});
    }
}


export const editService = async (req, res) => {
    const client = await pool.connect();
    const {id} = req.params;
    const {name, price} = req.body;



    try {
        await client.query("BEGIN");
        //validation
            
    } catch (error) {
        
    }
}