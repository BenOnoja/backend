// routes/getReviews.js
const express = require('express');
const pooly = require('../db').pool; // Ensure you have your PostgreSQL connection pool here
const router = express.Router();

// Fetch reviews by book_id
router.get('/get-reviews/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        const reviews = await pooly.query(
            `SELECT 
                u.username, 
                br.*
            FROM 
                bookstore.public.bookreviews br
            JOIN 
                bookstore.public.users u
            ON 
                br.user_id = u.telegram_user_id
            WHERE 
                br.book_id = $1`, // Use parameterized query for book_id
            [bookId]
        );
        res.json(reviews.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;