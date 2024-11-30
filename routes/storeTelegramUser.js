// routes/storeTelegramUser.js
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.post('/store-telegram-user', async (req, res) => {
    const { telegram_user_id, first_name, last_name, username, profile_picture_url, role } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE telegram_user_id = $1', [telegram_user_id]);

        if (existingUser.rows.length > 0) {
            await pool.query(
                `UPDATE users
                 SET first_name = $1, last_name = $2, username = $3, profile_picture_url = $4, role = $5, "updatedAt" = CURRENT_TIMESTAMP
                 WHERE telegram_user_id = $6`,
                [first_name, last_name, username, profile_picture_url, role, telegram_user_id]
            );
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            await pool.query(
                `INSERT INTO users (telegram_user_id, first_name, last_name, username, profile_picture_url, role)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [telegram_user_id, first_name, last_name, username, profile_picture_url, role]
            );
            res.status(201).json({ message: 'User created successfully' });
        }
    } catch (error) {
        console.error('Error storing Telegram user:', error);
        res.status(500).json({ message: 'Error storing Telegram user' });
    }
});

module.exports = router;
