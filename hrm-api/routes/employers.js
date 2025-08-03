const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

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

router.get('/get', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const [profile] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [decoded.id]);
    res.json(profile[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employer profile' });
  }
});

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [profiles] = await pool.query(
      'SELECT e.*, u.email FROM employers e JOIN users u ON e.user_id = u.id'
    );
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all employer profiles' });
  }
});

router.put('/update/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const { name, address, email, website } = req.body;
    const [employer] = await pool.query('SELECT * FROM employers WHERE id = ? AND user_id = ?', [id, decoded.id]);
    if (employer.length === 0) return res.status(404).json({ message: 'Employer profile not found' });

    await pool.query(
      'UPDATE employers SET name = ?, address = ?, email = ?, website = ? WHERE id = ?',
      [name, address, email, website, id]
    );
    res.json({ message: 'Employer profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employer profile' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer' && decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const [employer] = await pool.query('SELECT * FROM employers WHERE id = ? AND user_id = ?', [id, decoded.id]);
    if (employer.length === 0) return res.status(404).json({ message: 'Employer profile not found' });

    if (decoded.role === 'employer' && employer[0].user_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM employers WHERE id = ?', [id]);
    res.json({ message: 'Employer profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employer profile' });
  }
});

module.exports = router;