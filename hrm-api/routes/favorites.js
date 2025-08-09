// routes/favorites.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware kiểm tra token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Lấy danh sách yêu thích
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.id AS favorite_id, j.* 
       FROM favorites f
       JOIN jobposts j ON f.jobpost_id = j.id
       WHERE f.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// Thêm vào yêu thích
router.post('/', authenticateToken, async (req, res) => {
  const { jobpost_id } = req.body;
  if (!jobpost_id) return res.status(400).json({ message: 'jobpost_id is required' });

  try {
    await pool.query(
      `INSERT INTO favorites (user_id, jobpost_id) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
      [req.user.id, jobpost_id]
    );
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// Xóa khỏi yêu thích
router.delete('/:jobpost_id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM favorites WHERE user_id = ? AND jobpost_id = ?`,
      [req.user.id, req.params.jobpost_id]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

module.exports = router;
