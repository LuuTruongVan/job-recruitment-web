const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { title, description, salary, category, location } = req.body;
  if (!title || !description || !salary || !category || !location) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [result] = await pool.query(
      'INSERT INTO jobposts (title, description, salary, category, location, employer_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [title, description, salary, category, location, decoded.id]
    );
    res.status(201).json({ message: 'Job posted successfully' });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error posting job' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, location, salary } = req.query;
    let query = 'SELECT * FROM jobposts';
    const params = [];

    if (category || location || salary) {
      query += ' WHERE';
      const conditions = [];
      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }
      if (location) {
        conditions.push('location = ?');
        params.push(location);
      }
      if (salary) {
        conditions.push('salary >= ?');
        params.push(parseFloat(salary));
      }
      query += ' ' + conditions.join(' AND ');
    }

    const [jobs] = await pool.query(query, params);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

router.get('/my-jobs', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [jobs] = await pool.query('SELECT * FROM jobposts WHERE employer_id = ?', [decoded.id]);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user jobs' });
  }
});

router.delete('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { id } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, decoded.id]);
    if (job.length === 0) return res.status(403).json({ message: 'Unauthorized or job not found' });
    await pool.query('DELETE FROM jobposts WHERE id = ?', [id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

module.exports = router;