const express = require('express');
const pools = require('../db').pool;
const router = express.Router();

router.get('/get-uploaded-books/:userId', async (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM books WHERE uploaded_by = $1';
  const values = [userId];
  try {
    const result = await pools.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch uploaded books' });
  }
});

module.exports=router;