const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

// ✅ Get all candidates (admin only)
router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [candidates] = await pool.query(
      `SELECT c.id, c.full_name, c.phone, c.address, c.skills, c.avatar_url, u.email 
       FROM candidates c 
       LEFT JOIN users u ON c.user_id = u.id`
    );
    res.json(candidates);
  } catch (err) {
    console.error('GET /candidates/get-all error:', err);
    res.status(500).json({ message: 'Error fetching all candidates' });
  }
});

// ✅ Count candidates
router.get('/count', async (_, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM candidates');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching candidates count:', error);
    res.status(500).json({ message: 'Error fetching candidates count' });
  }
});

// ✅ Add candidate profile
router.post('/add', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const { full_name, phone, address, resume, skills, avatar_url } = req.body;
    const [existing] = await pool.query('SELECT * FROM candidates WHERE user_id = ?', [decoded.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Profile already exists' });

    await pool.query(
      'INSERT INTO candidates (user_id, full_name, phone, address, resume, skills, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [decoded.id, full_name, phone, address, resume, skills, avatar_url]
    );
    res.status(201).json({ message: 'Candidate profile added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding candidate profile' });
  }
});

// ✅ Update candidate profile
router.put('/update', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const { full_name, phone, address, resume, skills, avatar_url } = req.body;
    await pool.query(
      'UPDATE candidates SET full_name=?, phone=?, address=?, resume=?, skills=?, avatar_url=? WHERE user_id=?',
      [full_name, phone, address, resume, skills, avatar_url, decoded.id]
    );
    res.json({ message: 'Candidate profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating candidate profile' });
  }
});

// ✅ Get candidate profile
router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const [profile] = await pool.query(
      'SELECT id, full_name, phone, address, resume, skills, avatar_url FROM candidates WHERE user_id = ?',
      [decoded.id]
    );
    if (!profile.length) return res.status(404).json({ message: 'Candidate profile not found' });
    res.json(profile[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidate profile' });
  }
});

// ✅ Delete candidate profile
router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin' && decoded.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    if (decoded.role === 'candidate') {
      const [candidate] = await pool.query('SELECT * FROM candidates WHERE id = ? AND user_id = ?', [id, decoded.id]);
      if (candidate.length === 0) return res.status(404).json({ message: 'Not found or unauthorized' });
    }

    await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ message: 'Candidate profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /candidates/delete/:id error:', err);
    res.status(500).json({ message: 'Error deleting candidate profile' });
  }
});

module.exports = router;
