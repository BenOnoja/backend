const express = require('express');
const deletepool = require('../db').pool;
const { del } = require('@vercel/blob');
const multer = require('multer');
const upload = multer();
const router = express.Router();

router.delete('/delete-book/:id', async (req, res) => {
    const bookId = parseInt(req.params.id);

    try {
        const { rows } = await deletepool.query(
            'SELECT file_path, cover_photo_path FROM books WHERE id = $1',
            [bookId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { file_path, cover_photo_path } = rows[0];

        // Delete dependent records
        await deletepool.query('DELETE FROM transactions WHERE book_id = $1', [bookId]);
        await deletepool.query('DELETE FROM bookreviews WHERE book_id = $1', [bookId]);
        await deletepool.query('DELETE FROM reading_progress WHERE book_id = $1', [bookId]);

        // Delete the book record
        await deletepool.query('DELETE FROM books WHERE id = $1', [bookId]);

        // Delete files using @vercel/blob
        if (file_path) await del(new URL(file_path).pathname);
        if (cover_photo_path) await del(new URL(cover_photo_path).pathname);

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;