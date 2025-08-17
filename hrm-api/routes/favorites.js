const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware để lấy user_id từ token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 📌 Lấy tất cả favorites của user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT jobposts.* 
       FROM favorites 
       JOIN jobposts ON favorites.jobpost_id = jobposts.id 
       WHERE favorites.user_id = ? 
       AND jobposts.status = "approved"
       AND jobposts.expiry_date > NOW()`,  
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// 📌 Thêm vào favorites
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { jobpost_id } = req.body;
    if (!jobpost_id) return res.status(400).json({ message: 'jobpost_id is required' });

    // Kiểm tra nếu đã tồn tại
    const [exists] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ? AND jobpost_id = ?',
      [req.user.id, jobpost_id]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Job already in favorites' });
    }

    // Thêm vào favorites
    await pool.query('INSERT INTO favorites (user_id, jobpost_id) VALUES (?, ?)', [
      req.user.id,
      jobpost_id,
    ]);

    // ✅ Tăng count_favorite trong jobposts
    await pool.query(
      'UPDATE jobposts SET count_favorite = count_favorite + 1 WHERE id = ?',
      [jobpost_id]
    );

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Error adding favorite' });
  }
});


// 📌 Xóa khỏi favorites
router.delete('/:jobpost_id', authenticateUser, async (req, res) => {
  try {
    const { jobpost_id } = req.params;

    // Xóa favorites
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND jobpost_id = ?', [
      req.user.id,
      jobpost_id,
    ]);

    // ✅ Giảm count_favorite trong jobposts (không để âm)
    await pool.query(
      'UPDATE jobposts SET count_favorite = GREATEST(count_favorite - 1, 0) WHERE id = ?',
      [jobpost_id]
    );

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Error removing favorite' });
  }
});


// favorites.js
// 📌 API đếm số lượng yêu thích của 1 job
router.get('/count/:jobId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM favorites WHERE jobpost_id = ?',
      [req.params.jobId] // ✅ đúng, khớp với tên param ở route
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching favorite count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
