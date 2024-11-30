const express = require('express');
const multer = require('multer');
const { put } = require('@vercel/blob');
const bookpool = require('../db').pool;

const router = express.Router();
const upload = multer(); // Use multer memory storage for in-memory file uploads

router.post('/upload-book', upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]), async (req, res) => {
    const { title, description, price, author, uploadedBy, genre, webtoons } = req.body;

    if (!req.files || !req.files['file'] || !req.files['coverPhoto']) {
        return res.status(400).json({ message: 'File or cover photo is missing.' });
    }

    const file = req.files['file'][0];
    const coverPhoto = req.files['coverPhoto'][0];

    try {
        // Upload the book file
        const bookFile = await put(file.originalname, file.buffer, { contentType: file.mimetype });
        const fileUrl = bookFile.url;

        // Upload the cover photo
        const coverPhotoFile = await put(coverPhoto.originalname, coverPhoto.buffer, { contentType: coverPhoto.mimetype });
        const coverPhotoUrl = coverPhotoFile.url;

        // Insert book details into the database
        const result = await bookpool.query(
            `INSERT INTO books (title, author, description, genre, price, file_path, uploaded_by, cover_photo_path, webtoons) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                title,
                author,
                description || null,
                genre || null,
                parseFloat(price),
                fileUrl,
                parseInt(uploadedBy, 10),
                coverPhotoUrl,
                webtoons === 'true' // Convert webtoons to a boolean
            ]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error uploading book:', error);
        res.status(500).json({ message: 'Error uploading book' });
    }
});

module.exports = router;