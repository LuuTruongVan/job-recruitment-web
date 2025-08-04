const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/add', async (req, res) => {
  const { email, password, role } = req.body;
  console.log('Received /users/add request:', { email, role }); // Log request
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Error in /users/add:', error); // Log lỗi
    res.status(500).json({ message: 'Error adding user' });
  }
});

router.post('/get', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received /users/get request:', { email }); // Log request
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error in /users/get:', error); // Log lỗi
    res.status(500).json({ message: 'Error getting user' });
  }
});

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [users] = await pool.query('SELECT id, email, role, is_active, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.put('/update/:id/toggle', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });

    const newStatus = !user[0].is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
    res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Thêm route mới cho /get-profile
router.get('/get-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]); // Trả về { id, email, role }
  } catch (error) {
    console.error('Error in /get-profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;