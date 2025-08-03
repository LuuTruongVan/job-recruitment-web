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

    const { title, description, category, location, salary } = req.body;
    const [employers] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employers.length === 0) return res.status(400).json({ message: 'No employer profile associated' });

    const employerId = employers[0].id;
    await pool.query(
      'INSERT INTO jobposts (employer_id, title, description, category, location, salary) VALUES (?, ?, ?, ?, ?, ?)',
      [employerId, title, description, category, location, salary]
    );
    res.status(201).json({ message: 'Job post added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding job post' });
  }
});

router.get('/get', async (req, res) => {
  try {
    const [jobposts] = await pool.query('SELECT * FROM jobposts WHERE status = "open"');
    res.json(jobposts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job posts' });
  }
});

router.get('/get-my-jobposts', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const [jobposts] = await pool.query(
      'SELECT j.* FROM jobposts j JOIN employers e ON j.employer_id = e.id WHERE e.user_id = ?',
      [decoded.id]
    );
    res.json(jobposts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job posts' });
  }
});

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [jobposts] = await pool.query('SELECT * FROM jobposts');
    res.json(jobposts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all job posts' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer' && decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const [jobpost] = await pool.query(
      'SELECT e.user_id FROM jobposts j JOIN employers e ON j.employer_id = e.id WHERE j.id = ?',
      [id]
    );
    if (jobpost.length === 0) return res.status(404).json({ message: 'Job post not found' });

    if (decoded.role === 'employer' && jobpost[0].user_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM jobposts WHERE id = ?', [id]);
    res.json({ message: 'Job post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job post' });
  }
});

module.exports = router;