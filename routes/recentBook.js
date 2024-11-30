const express = require('express');
const poolo = require('../db').pool;
const router = express.Router();

router.get('/get-recent-books/:userId', async (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT b.*, rp.current_page, rp.last_read_at 
    FROM reading_progress rp 
    JOIN books b ON rp.book_id = b.id 
    WHERE rp.telegram_user_id = $1 
    ORDER BY rp.last_read_at DESC`;
  const values = [userId];
  try {
    const result = await poolo.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recent books' });
  }
});

module.exports=router;