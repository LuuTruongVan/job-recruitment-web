const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/add', upload.single('cv'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /add:', decoded); // Log để kiểm tra vai trò
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const { candidate_name, phone, email, address, skills, introduction, job_id } = req.body;
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const cvPath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!cvPath) {
      return res.status(400).json({ message: 'No CV file uploaded' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM applications WHERE user_id = ? AND jobpost_id = ?',
      [decoded.id, job_id]
    );
    if (existing.length > 0) return res.status(400).json({ message: 'Already applied' });

    await pool.query(
      'INSERT INTO applications (jobpost_id, user_id, candidate_name, phone, email, address, skills, introduction, cv_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [job_id, decoded.id, candidate_name, phone, email, address, skills, introduction, cvPath, 'pending']
    );
    res.status(201).json({ message: 'Application added successfully' });
  } catch (error) {
    console.error('Error adding application:', error);
    res.status(500).json({ message: 'Error adding application' });
  }
});

router.get('/get', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /get:', decoded); // Log để kiểm tra vai trò
    if (decoded.role !== 'candidate') {
      console.log('Access denied due to role:', decoded.role);
      return res.status(403).json({ message: 'Access denied' });
    }

    const [applications] = await pool.query(
      'SELECT a.*, j.title FROM applications a JOIN jobposts j ON a.jobpost_id = j.id WHERE a.user_id = ?',
      [decoded.id]
    );
    console.log('Fetched applications:', applications); // Log dữ liệu trả về
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.put('/update/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /update:', decoded); // Log để kiểm tra vai trò
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const { status, feedback } = req.body;
    const [application] = await pool.query(
      'SELECT j.employer_id FROM applications a JOIN jobposts j ON a.jobpost_id = j.id WHERE a.id = ?',
      [id]
    );
    if (application.length === 0) return res.status(404).json({ message: 'Application not found' });

    const employerId = application[0].employer_id;
    const [employers] = await pool.query('SELECT user_id FROM employers WHERE id = ?', [employerId]);
    if (employers.length === 0 || employers[0].user_id !== decoded.id) return res.status(403).json({ message: 'Unauthorized' });

    await pool.query(
      'UPDATE applications SET status = ?, feedback = ? WHERE id = ?',
      [status, feedback, id]
    );
    res.json({ message: 'Application updated successfully' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /get-all:', decoded); // Log để kiểm tra vai trò
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [applications] = await pool.query(
      'SELECT a.*, u.email AS user_email, j.title AS jobpost_title FROM applications a JOIN users u ON a.user_id = u.id JOIN jobposts j ON a.jobpost_id = j.id'
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all applications' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /delete:', decoded); // Log để kiểm tra vai trò
    if (decoded.role !== 'employer' && decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const [application] = await pool.query(
      'SELECT j.employer_id FROM applications a JOIN jobposts j ON a.jobpost_id = j.id WHERE a.id = ?',
      [id]
    );
    if (application.length === 0) return res.status(404).json({ message: 'Application not found' });

    if (decoded.role === 'employer' && application[0].employer_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application' });
  }
});

module.exports = router;