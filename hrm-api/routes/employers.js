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

    const [employers] = await pool.query(
      'SELECT e.*, u.email FROM employers e LEFT JOIN users u ON e.user_id = u.id'
    );
    res.json(employers);
  } catch (err) {
    console.error('GET /employers/get-all error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Error fetching all employers' });
  }
});

router.get('/count', async (_, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM employers');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching employers count:', error);
    res.status(500).json({ message: 'Error fetching employers count' });
  }
});


router.post('/add', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { name, address, email, website } = req.body;
    const [existing] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [decoded.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Employer profile already exists' });

    await pool.query(
      'INSERT INTO employers (user_id, name, address, email, website) VALUES (?, ?, ?, ?, ?)',
      [decoded.id, name, address, email, website]
    );
    res.status(201).json({ message: 'Employer profile added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding employer profile' });
  }
});

router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const [profile] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [decoded.id]);
    if (!profile.length) return res.status(404).json({ message: 'Employer profile not found' });
    res.json(profile[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employer profile' });
  }
});

// employers.js (chỉ phần cần thay)



router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;

    if (decoded.role === 'employer') {
      const [employer] = await pool.query('SELECT * FROM employers WHERE id = ? AND user_id = ?', [id, decoded.id]);
      if (employer.length === 0) return res.status(404).json({ message: 'Employer profile not found or unauthorized' });
    } else {
      const [employer] = await pool.query('SELECT * FROM employers WHERE id = ?', [id]);
      if (employer.length === 0) return res.status(404).json({ message: 'Employer profile not found' });
    }

    await pool.query('DELETE FROM employers WHERE id = ?', [id]);
    res.json({ message: 'Employer profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /employers/delete/:id error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Error deleting employer profile' });
  }
});




module.exports = router;