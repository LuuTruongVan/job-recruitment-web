const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

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

router.get('/:id', async (req, res) => { // Đảm bảo endpoint này tồn tại
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

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [profiles] = await pool.query(
      'SELECT c.*, u.email FROM candidates c JOIN users u ON c.user_id = u.id'
    );
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all candidate profiles' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate' && decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const [candidate] = await pool.query('SELECT * FROM candidates WHERE id = ? AND user_id = ?', [id, decoded.id]);
    if (candidate.length === 0) return res.status(404).json({ message: 'Candidate profile not found' });

    if (decoded.role === 'candidate' && candidate[0].user_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ message: 'Candidate profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting candidate profile' });
  }
});

module.exports = router;