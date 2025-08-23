const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

// ✅ Public: Lấy thông tin employer theo ID (đặt lên trên /:id)
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [employer] = await pool.query(
      `SELECT id, name, address, phone, email, website, company_intro, avatar_url 
       FROM employers 
       WHERE id = ?`,
      [id]
    );

    if (!employer.length) return res.status(404).json({ message: 'Employer not found' });

    res.json(employer[0]);
  } catch (error) {
    console.error('Error fetching public employer profile:', error);
    res.status(500).json({ message: 'Error fetching employer profile' });
  }
});

// ✅ Get all employers (admin only)
router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [employers] = await pool.query(
      `SELECT e.id, e.name, e.address, e.phone, e.email, e.website, e.company_intro, e.avatar_url, u.email AS user_email 
       FROM employers e 
       LEFT JOIN users u ON e.user_id = u.id`
    );
    
    res.json(employers);
  } catch (err) {
    console.error('GET /employers/get-all error:', err);
    res.status(500).json({ message: 'Error fetching all employers' });
  }
});

// ✅ Count employers
router.get('/count', async (_, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM employers');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching employers count:', error);
    res.status(500).json({ message: 'Error fetching employers count' });
  }
});

// ✅ Add employer profile
router.post('/add', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { name, address, email, website, company_intro, avatar_url } = req.body;
    const [existing] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [decoded.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Profile already exists' });

    await pool.query(
      'INSERT INTO employers (user_id, name, address, email, website, company_intro, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [decoded.id, name, address, email, website, company_intro, avatar_url]
    );
    res.status(201).json({ message: 'Employer profile added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding employer profile' });
  }
});

// ✅ Update employer profile
router.put('/update', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { name, address, email, website, company_intro, avatar_url } = req.body;
    await pool.query(
      'UPDATE employers SET name=?, address=?, email=?, website=?, company_intro=?, avatar_url=? WHERE user_id=?',
      [name, address, email, website, company_intro, avatar_url, decoded.id]
    );
    res.json({ message: 'Employer profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employer profile' });
  }
});

// ✅ Get employer profile
router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const [profile] = await pool.query(
      'SELECT id, name, address, email, website, company_intro, avatar_url FROM employers WHERE user_id = ?',
      [decoded.id]
    );
    if (!profile.length) return res.status(404).json({ message: 'Employer profile not found' });
    res.json(profile[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employer profile' });
  }
});

// ✅ Delete employer profile
router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;

    if (decoded.role === 'employer') {
      const [employer] = await pool.query('SELECT * FROM employers WHERE id = ? AND user_id = ?', [id, decoded.id]);
      if (employer.length === 0) return res.status(404).json({ message: 'Not found or unauthorized' });
    }

    await pool.query('DELETE FROM employers WHERE id = ?', [id]);
    res.json({ message: 'Employer profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /employers/delete/:id error:', err);
    res.status(500).json({ message: 'Error deleting employer profile' });
  }
});


// employers.js
router.get('/by-user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Employer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;




module.exports = router;
