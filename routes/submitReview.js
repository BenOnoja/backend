// routes/submitReview.js
const express = require('express');
var poolie = require('../db').pool; // Ensure you have your PostgreSQL connection pool here
const router = express.Router();

// Submit a new review
router.post('/submit-review', async (req, res) => {
    const { book_id, user_id, rating, review_text } = req.body;
    try {
        await poolie.query(
            'INSERT INTO bookreviews (book_id, user_id, rating, review_text, review_date) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
            [book_id, user_id, rating, review_text]
        );
        res.status(201).send('Review submitted successfully');
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;