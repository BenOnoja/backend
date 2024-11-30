const express = require('express');
const poolb = require('../db').pool;
const { put, del } = require('@vercel/blob');
const multer = require('multer');
const upload = multer();
const router = express.Router();

router.put('/edit-book/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), async (req, res) => {
    const { id } = req.params;
    const { title, description, price, genre, webtoons } = req.body;

    try {
        const { rows } = await poolb.query('SELECT * FROM books WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });

        const book = rows[0];
        let filePath = book.file_path;
        let coverPhotoPath = book.cover_photo_path;

        // Update the book file
        if (req.files['file']) {
            const newFile = req.files['file'][0];
            const newBookFile = await put(newFile.originalname, newFile.buffer, { contentType: newFile.mimetype });
            filePath = newBookFile.url;

            // Delete the old file
            if (book.file_path) await del(new URL(book.file_path).pathname);
        }

        // Update the cover photo
        if (req.files['coverPhoto']) {
            const newCoverPhoto = req.files['coverPhoto'][0];
            const newCoverPhotoFile = await put(newCoverPhoto.originalname, newCoverPhoto.buffer, { contentType: newCoverPhoto.mimetype });
            coverPhotoPath = newCoverPhotoFile.url;

            // Delete the old cover photo
            if (book.cover_photo_path) await del(new URL(book.cover_photo_path).pathname);
        }

        const updateQuery = `
            UPDATE books
            SET title = $1, description = $2, price = $3, genre = $4, file_path = $5, cover_photo_path = $6, webtoons = $7
            WHERE id = $8
            RETURNING *`;
        const updatedBook = await poolb.query(updateQuery, [title, description, price, genre, filePath, coverPhotoPath, webtoons, id]);

        res.status(200).json(updatedBook.rows[0]);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Error updating book' });
    }
});

module.exports = router;