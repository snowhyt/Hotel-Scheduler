import pool from "../db.js";


//create payment
// export const createPayment = async(req,res) => {
//     const {booking_id, amount, payment_method, payment_type, payment_status,
//         reference_number, payment_date, notes} = req.body;
    
//     const client = await pool.connect();
    
//     try {
//         //start
//         await client.query("BEGIN");

//         //add validation later

//         const paymentResult =
//                 await client.query(
//                     `INSERT INTO payments (
//                         booking_id, amount, payment_method, reference_number,
//                         payment_date, notes, payment_type, payment_status
//                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//                     [
//                         booking_id,
//                         amount,
//                         payment_method,
//                         reference_number,
//                         payment_date,
//                         notes,
//                         payment_type,
//                         payment_status
//                     ]

//         );
//         const payment = paymentResult.rows[0];

//         await client.query("COMMIT");
//         client.release();
//         res.status(201).json({ message: "Payment created", payment });  
//     } catch (err) {
//         await client.query("ROLLBACK");
//         client.release();
//         console.error("Error in createPayment:", err);  
//         res.status(500).json({error: err.message});
//     }
        
// }


export const createPayment = async(req,res) => {
   console.log("REQ BODY:", req.body);
    const {
        booking_id, amount, payment_method, reference_number,
        payment_date, notes
    } = req.body;

    if(!booking_id || !amount) {
        return res.status(400).json({message: "booking_id and amount are required"});
    }

        const client = await pool.connect();

    try{
        await client.query("BEGIN");

const invoiceResult = await client.query(
    `SELECT * FROM invoices WHERE booking_id = $1`,
    [booking_id]

);
if(invoiceResult.rows.length === 0){
    await client.query("ROLLBACK");
    return res.status(404).json({message: "Invoice not found"});

}

    const invoice = invoiceResult.rows[0];

    const sumResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE booking_id = $1`,
        [booking_id]

    );

    const alreadyPaid = Number(sumResult.rows[0].total);
    const grandtotal = Number(invoice.grandtotal);
    const newAmount = Number(amount);

    //validation - does not allow overpayment
        if (alreadyPaid >= grandtotal) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Invoice is already fully paid" });
        }
        if (alreadyPaid + newAmount > grandtotal) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: `Payment of ${newAmount} exceeds remaining balance of ${grandtotal - alreadyPaid}`
            });
        }

    //Insert the payment
    const totalAfterPayment = alreadyPaid + newAmount;
    const isFullyPaid = totalAfterPayment >= grandtotal;

    const paymentResult = await client.query(
        `INSERT INTO payments (
                booking_id, amount, payment_method, reference_number,
                payment_date, notes, payment_type, payment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                booking_id, newAmount, payment_method, reference_number || null,
                payment_date, notes || null,
                isFullyPaid ? "fullpayment" : "partialpayment",
                isFullyPaid ? "paid" : "partial"
            ]
    );

    //update invoice amount_paid, balance_due, invoice_status
    await client.query(
        `UPDATE invoices 
        SET
            amount_paid = $1,
            invoice_status =$2
            WHERE booking_id = $3`,
            [
                totalAfterPayment,
                isFullyPaid ? "paid" : "partial",
                booking_id
            ]
    );

    //update booking status
    await client.query(
        `UPDATE bookings
        SET 
            booking_status = $1
            WHERE id = $2`,
            [ isFullyPaid ? "confirmed" : "pending", booking_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
        message: isFullyPaid ? "Payment completed - invoice fully paid" : "Partial payment recorded",
        payment: paymentResult.rows[0],
        totalPaid: totalAfterPayment,
        balanceDue: isFullyPaid ? 0 : grandtotal - totalAfterPayment
    
    });

    } catch(error){
        await client.query("ROLLBACK");
        console.error("Error in createPayment:", error);
        res.status(500).json({ error: error.message });
    }  finally {
        client.release();
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
export const getPaymentById = async(req,res) => {
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
export const editPayment = async (req, res) => {
    const {id, amount, payment_method, payment_type, payment_status, transaction_id, payment_date, notes } = req.body;  
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        //validation here

        const paymentResult = await client.query(
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

export const deletePayment = async (req,res) => {
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
        console.error("Error in createPayment:", error);
        res.status(500).json({ error: error.message }); 
        
    
    } finally {
        client.release();
    }
}