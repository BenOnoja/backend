const express = require('express');
const pool = require('../db').pool;
const router = express.Router();

// Route to save reading progress
router.post('/save-progress', async (req, res) => {
    const { telegram_user_id, book_id, current_page } = req.body;
    try {
        // Upsert the progress (insert if not exists, update if exists)
        const query = `
            INSERT INTO reading_progress (telegram_user_id, book_id, current_page, last_read_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (telegram_user_id, book_id)
            DO UPDATE SET current_page = $3, last_read_at = CURRENT_TIMESTAMP;
        `;
        await pool.query(query, [telegram_user_id, book_id, current_page]);

        res.status(200).json({ message: 'Progress saved successfully.' });
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ message: 'Failed to save progress.' });
    }
});

// Route to get reading progress for a specific user and book
router.get('/get-progress', async (req, res) => {
    const { telegram_user_id, book_id } = req.query;
    try {
        const query = `SELECT current_page FROM reading_progress WHERE telegram_user_id = $1 AND book_id = $2`;
        const result = await pool.query(query, [telegram_user_id, book_id]);

        if (result.rows.length > 0) {
            res.status(200).json({ current_page: result.rows[0].current_page });
        } else {
            res.status(200).json({ current_page: 1 }); // Default to page 1 if no progress found
        }
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Failed to fetch progress.' });
    }
});

module.exports = router;