const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ FE gửi lên
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [candidates] = await pool.query(
      'SELECT c.*, u.email FROM candidates c LEFT JOIN users u ON c.user_id = u.id'
    );
    res.json(candidates);
  } catch (err) {
    console.error('GET /candidates/get-all error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Error fetching all candidates' });
  }
});

// Đặt ở trên cùng, trước middleware check token (nếu có)
router.get('/count', async (_, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM candidates');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching candidates count:', error);
    res.status(500).json({ message: 'Error fetching candidates count' });
  }
});


router.post('/add', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const { full_name, phone, address, resume, skills } = req.body;
    const [existing] = await pool.query('SELECT * FROM candidates WHERE user_id = ?', [decoded.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Profile already exists' });

    await pool.query(
      'INSERT INTO candidates (user_id, full_name, phone, address, resume, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [decoded.id, full_name, phone, address, resume, skills]
    );
    res.status(201).json({ message: 'Candidate profile added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding candidate profile' });
  }
});

router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const [profile] = await pool.query('SELECT * FROM candidates WHERE user_id = ?', [decoded.id]);
    if (!profile.length) return res.status(404).json({ message: 'Candidate profile not found' });
    res.json(profile[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidate profile' });
  }
});




router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cho phép admin xóa bất kỳ candidate nào; candidate chỉ xóa hồ sơ của mình
    if (decoded.role !== 'admin' && decoded.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    if (decoded.role === 'candidate') {
      // candidate chỉ được xóa profile của chính họ
      const [candidate] = await pool.query('SELECT * FROM candidates WHERE id = ? AND user_id = ?', [id, decoded.id]);
      if (candidate.length === 0) return res.status(404).json({ message: 'Candidate profile not found or unauthorized' });
    } else {
      // admin: optional check if exists
      const [candidate] = await pool.query('SELECT * FROM candidates WHERE id = ?', [id]);
      if (candidate.length === 0) return res.status(404).json({ message: 'Candidate profile not found' });
    }

    await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ message: 'Candidate profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /candidates/delete/:id error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Error deleting candidate profile' });
  }
});




module.exports = router;