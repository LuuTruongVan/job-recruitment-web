const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// ===== Multer =====
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===== Helper: tạo + emit thông báo =====
async function createAndEmitNotification(io, userId, title, message) {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, NOW())`,
    [userId, title, message]
  );

  const newNotification = {
    id: result.insertId,
    user_id: userId,
    title,
    message,
    is_read: 0,
    created_at: new Date(),
  };

  if (io) {
    console.log(`📢 Emit notification -> room user:${userId}`, { title, message });
    io.to(`user:${userId}`).emit('notification', newNotification);
  } else {
    console.warn('⚠️ io not found on app when emitting notification');
  }

  return newNotification;
}

// ===== Helper: tạo thông báo từ utils (cho consistency) =====
const { createNotification } = require("../utils/notifications");

// =========================
// POST /applications/add  (Candidate nộp hồ sơ)
// =========================
router.post('/add', upload.single('cv'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /add:', decoded);
    if (decoded.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied. Only candidates can apply.' });
    }

    const { candidate_name, phone, email, address, skills, introduction, jobpost_id } = req.body;

    if (!candidate_name || !phone || !email || !address || !skills || !introduction || !jobpost_id) {
      return res.status(400).json({ message: 'All fields are required except CV.' });
    }

    const cvPath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!cvPath) return res.status(400).json({ message: 'CV file is required.' });

    // Check trùng ứng tuyển
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND jobpost_id = ?',
      [decoded.id, jobpost_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    await pool.query(
      `INSERT INTO applications 
        (jobpost_id, user_id, candidate_name, phone, email, address, skills, introduction, cv_path, status, applied_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [jobpost_id, decoded.id, candidate_name, phone, email, address, skills, introduction, cvPath]
    );

    // Thông báo cho employer
    const [rows] = await pool.query(
      `SELECT jp.title, e.user_id AS employer_user_id
       FROM jobposts jp 
       JOIN employers e ON e.id = jp.employer_id
       WHERE jp.id = ?`,
      [jobpost_id]
    );

    if (rows.length > 0) {
      const { title, employer_user_id } = rows[0];
      const io = req.app.get('io');
      await createAndEmitNotification(
        io,
        employer_user_id,
        'Ứng tuyển mới',
        `Ứng viên "${candidate_name}" vừa ứng tuyển công việc "${title}".`
      );
    } else {
      console.warn('⚠️ Jobpost not found when applying:', jobpost_id);
    }

    res.status(201).json({ message: 'Application added successfully' });
  } catch (error) {
    console.error('Error adding application:', error);
    res.status(500).json({ message: 'Error adding application', error: error.message });
  }
});

// =========================
// GET /applications/get  (Candidate xem đơn của mình)
// =========================
router.get('/get', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /get:', decoded);
    if (decoded.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [applications] = await pool.query(
      `SELECT a.*, j.title 
       FROM applications a 
       JOIN jobposts j ON a.jobpost_id = j.id 
       WHERE a.user_id = ? 
       ORDER BY a.applied_at DESC`,
      [decoded.id]
    );
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// =========================
// PUT /applications/update/:id  (Employer duyệt)
// =========================
router.put('/update/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const { status, feedback } = req.body;

    // Lấy candidate_user_id + employer_id + job title
    const [appRows] = await pool.query(
      `SELECT a.user_id AS candidate_user_id, j.employer_id, j.title 
       FROM applications a 
       JOIN jobposts j ON a.jobpost_id = j.id 
       WHERE a.id = ?`,
      [id]
    );
    if (appRows.length === 0) return res.status(404).json({ message: 'Application not found' });

    const { candidate_user_id, employer_id, title } = appRows[0];

    // Kiểm tra employer sở hữu jobpost
    const [employers] = await pool.query(
      'SELECT user_id FROM employers WHERE id = ?',
      [employer_id]
    );
    if (employers.length === 0 || employers[0].user_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cập nhật status
    await pool.query('UPDATE applications SET status = ?, feedback = ? WHERE id = ?', [status, feedback ?? null, id]);

    // Gửi thông báo cho candidate (sử dụng hàm chung)
    const io = req.app.get('io');
    await createNotification(
      candidate_user_id,
      'Cập nhật trạng thái hồ sơ',
      `Hồ sơ "${title}" đã được cập nhật: ${status}${feedback ? ` (Ghi chú: ${feedback})` : ''}`,
      io
    );

    res.json({ message: 'Application updated successfully' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

// =========================
// PUT /applications/jobposts/:jobId/applications/:appId/approve  (Employer duyệt)
// =========================
router.put('/jobposts/:jobId/applications/:appId/approve', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { jobId, appId } = req.params;

    // Kiểm tra quyền sở hữu jobpost
    const [job] = await pool.query(
      'SELECT employer_id FROM jobposts WHERE id = ?',
      [jobId]
    );
    if (job.length === 0) return res.status(404).json({ message: 'Job post not found' });

    const [employers] = await pool.query(
      'SELECT user_id FROM employers WHERE id = ?',
      [job[0].employer_id]
    );
    if (employers.length === 0 || employers[0].user_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cập nhật status và lấy thông tin
    const [appRows] = await pool.query(
      `SELECT a.user_id AS candidate_user_id, j.title 
       FROM applications a 
       JOIN jobposts j ON a.jobpost_id = j.id 
       WHERE a.id = ?`,
      [appId]
    );
    if (appRows.length === 0) return res.status(404).json({ message: 'Application not found' });

    const { candidate_user_id, title } = appRows[0];
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['approved', appId]);

    // Gửi thông báo cho candidate
    const io = req.app.get('io');
    await createNotification(
      candidate_user_id,
      'Cập nhật trạng thái hồ sơ',
      `Hồ sơ "${title}" đã được duyệt`,
      io
    );

    res.json({ message: 'Application approved successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Error approving application' });
  }
});

// =========================
// PUT /applications/jobposts/:jobId/applications/:appId/reject  (Employer từ chối)
// =========================
router.put('/jobposts/:jobId/applications/:appId/reject', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { jobId, appId } = req.params;

    // Kiểm tra quyền sở hữu jobpost
    const [job] = await pool.query(
      'SELECT employer_id FROM jobposts WHERE id = ?',
      [jobId]
    );
    if (job.length === 0) return res.status(404).json({ message: 'Job post not found' });

    const [employers] = await pool.query(
      'SELECT user_id FROM employers WHERE id = ?',
      [job[0].employer_id]
    );
    if (employers.length === 0 || employers[0].user_id !== decoded.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cập nhật status và lấy thông tin
    const [appRows] = await pool.query(
      `SELECT a.user_id AS candidate_user_id, j.title 
       FROM applications a 
       JOIN jobposts j ON a.jobpost_id = j.id 
       WHERE a.id = ?`,
      [appId]
    );
    if (appRows.length === 0) return res.status(404).json({ message: 'Application not found' });

    const { candidate_user_id, title } = appRows[0];
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['rejected', appId]);

    // Gửi thông báo cho candidate
    const io = req.app.get('io');
    await createNotification(
      candidate_user_id,
      'Cập nhật trạng thái hồ sơ',
      `Hồ sơ "${title}" đã bị từ chối`,
      io
    );

    res.json({ message: 'Application rejected successfully' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Error rejecting application' });
  }
});

// =========================
// GET /applications/get-all (admin)
// =========================
router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [applications] = await pool.query(
      `SELECT a.*, u.email AS user_email, j.title AS jobpost_title 
       FROM applications a 
       JOIN users u ON a.user_id = u.id 
       JOIN jobposts j ON a.jobpost_id = j.id
       ORDER BY a.applied_at DESC`
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all applications' });
  }
});

// =========================
// DELETE /applications/delete/:id
// =========================
router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;

    if (decoded.role === 'candidate') {
      const [application] = await pool.query(
        'SELECT id FROM applications WHERE id = ? AND user_id = ?',
        [id, decoded.id]
      );
      if (application.length === 0) {
        return res.status(404).json({ message: 'Application not found or unauthorized' });
      }
      await pool.query('DELETE FROM applications WHERE id = ?', [id]);
      return res.json({ message: 'Application deleted successfully' });
    }

    if (decoded.role === 'employer') {
      const [application] = await pool.query(
        'SELECT j.employer_id FROM applications a JOIN jobposts j ON a.jobpost_id = j.id WHERE a.id = ?',
        [id]
      );
      if (application.length === 0) return res.status(404).json({ message: 'Application not found' });

      if (application[0].employer_id !== decoded.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await pool.query('DELETE FROM applications WHERE id = ?', [id]);
      return res.json({ message: 'Application deleted successfully' });
    }

    if (decoded.role === 'admin') {
      const [application] = await pool.query('SELECT id FROM applications WHERE id = ?', [id]);
      if (application.length === 0) return res.status(404).json({ message: 'Application not found' });

      await pool.query('DELETE FROM applications WHERE id = ?', [id]);
      return res.json({ message: 'Application deleted successfully' });
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application' });
  }
});

// =========================
// GET /applications/count
// =========================
router.get('/count', async (_, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM applications');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching applications count:', error);
    res.status(500).json({ message: 'Error fetching applications count' });
  }
});

module.exports = router;