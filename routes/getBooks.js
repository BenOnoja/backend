const express = require('express');
const pooli  = require('../db').pool;

const router = express.Router();

// Fetch all books
router.get('/get-books', async (req, res) => {
    try {
        const result = await pooli.query('SELECT * FROM books');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Fetch book by ID
router.get('/get-book/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pooli.query('SELECT * FROM books WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json(result.rows[0]); // Return the first (and only) row
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).json({ message: 'Error fetching book details' });
    }
});


module.exports = router;