import pool from "../db.js";


//create payment
export const createPayment = async(req,res) => {
    const {booking_id, amount, payment_method, payment_type, payment_status,
        transaction_id, payment_date, notes} = req.body;
    
    const client = await pool.connect();
    
    try {
        //start
        await client.query("BEGIN");

        //add validation later

        const paymentResult = await client.query(
            `INSERT INTO payments (booking_id, amount, payment_method, payment_type, payment_status,
                transaction_id, payment_date, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
                [booking_id, amount, payment_method, payment_type, payment_status, transaction_id, payment_date, notes]
        );
        const payment = paymentResult.rows[0];

        await client.query("COMMIT");
        client.release();

    } catch (err) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error in createPayment:", err);  
        res.status(500).json({error: err.message});
    }
        
}

//get all payments
export const getAllPayment = async(req,res) => {

    const client = await pool.connect();

    try {

        //add validation here later


        await client.query("BEGIN");
        
        const paymentResult = await client.query(
            `SELECT * FROM payments`
        );

        await client.query("COMMIT");
        client.release();
        res.json(paymentResult.rows);

    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

//get payments by ID
export const getPaymentByID = async(req,res) => {
    const {id} = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        //validation here

        const paymentResult = await client.query(
            `SELECT * FROM payments WHERE id = $1`,
            [id]
        );

        await client.query("COMMIT");
        client.release();
        res.json(paymentResult.rows[0]);



    } catch (err) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error in getPaymentByID:", err);
        res.status(500).json({error: err.message});
    }
}

//edit payment
export const editpayment = async (req, res) => {
    const {id, amount, payment_method, payment_type, payment_status, transaction_id, payment_date, notes } = req.body;  
    const client = pool.connect();
    
    try {
        await client.query("BEGIN");

        //validation here

        const paymentResult = (await client).query(
            `UPDATE payments SET amount = $1, payment_method = $2, payment_type = $3, payment_status = $4,
            transaction_id = $5, payment_date = $6, notes = $7 WHERE id = $8`,
            [amount, payment_method, payment_type, payment_status, transaction_id, payment_date, notes, id]
        )

        const payment = await paymentResult.rows[0];

        await client.query("COMMIT");
        client.release();



    } catch (error) {
        await client.query("ROLLBACK");
        await client.release();
    }
}

export const deletepayment = async (req,res) => {
    const client = await pool.connect();
    const {id} = req.params;
    try {

        await client.query("BEGIN");
        const paymentResult = await client.query(
        `DELETE FROM payments WHERE id = $1 RETURNING *`,
        [id]
    );

    if(paymentResult.rowcount === 0){
        return res.status(404).json({
            message: "Payment not found"
        });
    }

    res.json({
        message: "Payment deleted successfully",
        payment: paymentResult.rows[0]
    });


    await client.query("COMMIT");
    client.release();

    
    } catch (err) {
        await client.query("ROLLBACK");
    client.release();
        res.status(500).json({error: err.message});
    
    }
}