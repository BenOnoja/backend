const express = require('express');
const axios = require('axios');
const crypto = require('crypto'); // Required for webhook verification
const paymentpool = require('../db').pool; // Ensure the path matches your project structure

const router = express.Router();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize Payment
router.post('/initialize-payment', async (req, res) => {
    const { email, amount, bookId, telegramUserId } = req.body;

    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amount * 100, // Paystack expects amount in kobo
                metadata: { bookId, buyerId: telegramUserId }, // Add bookId and buyerId to metadata
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({
            status: true,
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference,
        });
    } catch (error) {
        console.error('Error initializing payment:', error.message);
        res.status(500).json({ status: false, message: 'Payment initialization failed' });
    }
});

// Verify Payment
router.get('/payment-status/:reference', async (req, res) => {
    const { reference } = req.params;

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const paymentData = response.data.data;

        if (paymentData.status === 'success') {
            // Generate a proof of payment code (e.g., a random 6-character alphanumeric string)
            const proof_of_payment_code = crypto.randomBytes(3).toString('hex').toUpperCase();

            // Call recordPayment function to store successful payment
            await recordPayment(paymentData, proof_of_payment_code);

            res.json({
                status: true,
                message: 'Payment verified successfully',
                data: paymentData,
            });
        } else {
            res.json({ status: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error.message);
        res.status(500).json({ status: false, message: 'Payment verification failed' });
    }
});

// Webhook Endpoint to Handle Paystack Events
router.post('/paystack-webhook', async (req, res) => {
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;

        // Process only successful payment events
        if (event.event === 'charge.success') {
            const paymentData = event.data;
            try {
                // Generate a proof of payment code
                const proof_of_payment_code = crypto.randomBytes(3).toString('hex').toUpperCase();

                // Call recordPayment function to store successful payment
                await recordPayment(paymentData, proof_of_payment_code);

                res.sendStatus(200);
            } catch (error) {
                console.error('Error recording payment from webhook:', error.message);
                res.sendStatus(500);
            }
        } else {
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(400); // Invalid signature
    }
});

// Function to Record Payment in the Database
async function recordPayment(paymentData, proof_of_payment_code) {
    const { reference, amount, metadata } = paymentData;
    const { bookId, buyerId } = metadata; // bookId and buyerId from metadata

    const result = await paymentpool.query(
        `INSERT INTO transactions (book_id, buyer_id, amount, transaction_date, reference, proof_of_payment_code, has_paid)
         VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING *`,
        [bookId, buyerId, amount / 100, reference, proof_of_payment_code, true] // Divide amount by 100 to convert kobo to Naira
    );

    console.log('Payment recorded successfully:', result.rows[0]);
    return result.rows[0];
}

router.get('/transaction-status', async (req, res) => {
    const { telegram_user_id, book_id } = req.query;

    if (!telegram_user_id || !book_id) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    try {
        const result = await paymentpool.query(
            `SELECT has_paid 
             FROM transactions 
             WHERE buyer_id = $1 AND book_id = $2`,
            [telegram_user_id, book_id]
        );

        if (result.rows.length > 0) {
            return res.json({ has_paid: result.rows[0].has_paid });
        } else {
            return res.status(404).json({ error: 'Transaction not found.' });
        }
    } catch (error) {
        console.error('Error querying payment status:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;


module.exports = router;
