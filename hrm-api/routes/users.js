const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/add', async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log('Received /users/add request:', { name, email, role });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    const userId = result.insertId;

    if (role === 'candidate') {
      await connection.execute(
        'INSERT INTO candidates (user_id, full_name, phone, address, resume, skills) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, '', '', '', '']
      );
    } else if (role === 'employer') {
      await connection.execute(
        'INSERT INTO employers (user_id, name, address, email, website) VALUES (?, ?, ?, ?, ?)',
        [userId, name, '', email, '']
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in /users/add:', error);
    res.status(500).json({ message: 'Error adding user' });
  }
});

router.post('/get', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received /users/get request:', { email });
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error in /users/get:', error);
    res.status(500).json({ message: 'Error getting user' });
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

router.get('/get-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    let profile = users[0];
    if (profile.role === 'candidate') {
      const [candidate] = await pool.query(
        'SELECT full_name, phone, address, resume, skills FROM candidates WHERE user_id = ?',
        [decoded.id]
      );
      profile = { ...profile, ...candidate[0] || { full_name: '', phone: '', address: '', resume: '', skills: '' } };
    } else if (profile.role === 'employer') {
      const [employer] = await pool.query(
        'SELECT name, address, email, phone, website FROM employers WHERE user_id = ?',
        [decoded.id]
      );
      profile = { ...profile, ...employer[0] || { name: '', address: '', email: '', phone: '', website: '' } };
    }

    res.json(profile);
  } catch (error) {
    console.error('Error in /get-profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});


router.put('/update-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { full_name, phone, address, resume, skills, name: company_name, email, website } = req.body;
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    if (decoded.role === 'candidate') {
      await connection.execute(
        'UPDATE candidates SET full_name = ?, phone = ?, address = ?, resume = ?, skills = ? WHERE user_id = ?',
        [full_name, phone, address, resume, skills, decoded.id]
      );
      await connection.execute(
        'UPDATE users SET name = ? WHERE id = ?', [full_name, decoded.id]
      );
    } else if (decoded.role === 'employer') {
      await connection.execute(
        'UPDATE employers SET name = ?, address = ?, email = ?, phone = ?, website = ? WHERE user_id = ?',
        [company_name, address, email, phone, website, decoded.id]
      );
      await connection.execute(
        'UPDATE users SET name = ? WHERE id = ?', [company_name, decoded.id]
      );
    }

    await connection.commit();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in /update-profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});


// Thêm route đổi mật khẩu
router.put('/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Lỗi đổi mật khẩu' });
  }
});

router.get('/candidate-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [candidate] = await pool.query(
      'SELECT full_name, phone, address, resume, skills FROM candidates WHERE user_id = ?',
      [decoded.id]
    );
    if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate[0]);
  } catch (error) {
    console.error('Error in /candidate-profile:', error);
    res.status(500).json({ message: 'Error fetching candidate profile' });
  }
});

router.get('/employer-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query(
      'SELECT name, address, email, website FROM employers WHERE user_id = ?',
      [decoded.id]
    );
    if (employer.length === 0) return res.status(404).json({ message: 'Employer not found' });
    res.json(employer[0]);
  } catch (error) {
    console.error('Error in /employer-profile:', error);
    res.status(500).json({ message: 'Error fetching employer profile' });
  }
});

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /users/get-all:', decoded);
    const [users] = await pool.query('SELECT id, name, email, role FROM users');
    console.log('Fetched users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching all users' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /users/delete:', decoded);
    const { id } = req.params;

    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;