const express = require('express');
const pooli = require('../db').pool;

const router = express.Router();

// Fetch all books
router.get('/get-books', async (req, res) => {
    console.log('GET /get-books endpoint hit'); // Log when the endpoint is accessed
    try {
        const result = await pooli.query('SELECT * FROM books');
        console.log('Fetched books:', result.rows); // Log the retrieved books
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Fetch book by ID
router.get('/get-book/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`GET /get-book/${id} endpoint hit`); // Log the book ID being fetched
    try {
        const result = await pooli.query('SELECT * FROM books WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            console.log(`Book with ID ${id} not found`); // Log when a book is not found
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log('Fetched book:', result.rows[0]); // Log the fetched book details
        res.status(200).json(result.rows[0]); // Return the first (and only) row
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).json({ message: 'Error fetching book details' });
    }
});

module.exports = router;