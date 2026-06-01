import express from "express";
import pool from "../db.js";

//get all guest
export const getAllGuest=  async(req,res) => {
    const client = await pool.connect();
    const { guest_id, name, email, phone, address} = req.query;
    try {
        client.query("BEGIN");

        const guestResult = client.query(
            `SELECT * FROM guests`
        );

        client.query("COMMIT");
        client.release();
        res.json(guestResult.rows);
        
    } catch (error) {
        client.query("ROLLBACK");
        client.release();
        console.error("Error in getAllGuest:", error);
        res.status(500).json({error: error.message});
    }
}

export const getGuestById = async (req, res) => {
}

//create guest
export const createGuest = async (req,res) => {
    const {name, email, phone, address} = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");


        //validation: check if guest exist
        const guestCheck = await client.query(
            `SELECT * FROM guests WHERE name = $1 AND phone = $2`,
            [name, phone]
        );

        if(guestCheck.rows.length > 0){
            await client.query("COMMIT");
            return res.json({
                message: "Guest already exist"
            });
        }

        //insert new guest

        const guestResult = await client.query(
            `INSERT INTO guests (name, email, phone, address)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email || null, phone, address || null]
        );
        await client.query("COMMIT");
        const guest = guestResult.rows[0];
        res.status(201).json(guestResult.rows[0]);

    } catch (err) {
        await client.query("ROLLBACK");
       
        console.error("Error in createGuest:", err);
        res.status(500).json({error: err.message});
    } finally {
        client.release();
    }

}

//update guest
export const updateGuest = async (req,res) => {
    const {id} = req.params;
    const {name, email, phone, address} = req.body;
    const client = await pool.connect();
    try {
        client.query("BEGIN");

        //validation
        const guestCheck = await client.query(
            `SELECT * FROM guests WHERE id = $1`,
            [id]
        );
        if(guestCheck.rows.length === 0){
            return res.status(404).json({
                message: "Guest not found"
            });
        }

        //update
        const guestResult = await client.query(
            `UPDATE guests SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *`,
            [name, email, phone, address, id]
        );

        const guest = guestResult.rows[0];

        client.query("COMMIT");
        client.release();

        res.json(guest);
        
    } catch (error) {
        client.query("ROLLBACK");
        client.release();
        console.error("Error in updateGuest:", error);
        res.status(500).json({error: error.message});
    }
}

//delete guest
export const deleteGuest = async (req,res) => {
    const {id} = req.params;
    const client = await pool.connect();

    try {
        client.query("BEGIN");

        //validation
        const guestCheck = await client.query(
            `SELECT * FROM guests WHERE id = $1`,
            [id]
        );
        if(guestCheck.rows.length === 0){
            return res.status(404).json({
                message: "Guest not found"
            });
        }

        const guestResult = await client.query(
            `DELETE FROM guests WHERE id = $1 RETURNING *`,
            [id]
        );
        client.query("COMMIT");
        client.release();

        res.json({
            message: "Guest deleted successfully",
            guest: guestResult.rows[0]
        });



    } catch (error) {
        client.query("ROLLBACK");
        client.release();
        res.status(500).json({error: error.message});
       
    }
}
