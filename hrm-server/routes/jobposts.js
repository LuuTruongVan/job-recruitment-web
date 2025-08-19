const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

router.get('/count', async (_, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM jobposts');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching jobposts count:', error);
    res.status(500).json({ message: 'Error fetching jobposts count' });
  }
});


router.get('/admin', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /jobposts/admin:', decoded);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [jobPosts] = await pool.query('SELECT * FROM jobposts');
    if (!jobPosts.length) return res.status(404).json({ message: 'No job posts found' });
    res.json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all job posts' });
  }
});

router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Received token:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { title, jobInfo, jobPositionId, jobRequirements, benefits, salary, category, location, emailContact, expiry_date, company_name, employmentType } = req.body;
  console.log('Received job data:', req.body);
  if (!title || !jobInfo || !jobRequirements || !benefits || !salary || !category || !location || !emailContact) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;

    const [result] = await pool.query(
      'INSERT INTO jobposts (title, job_info, job_position_id, job_requirements, benefits, salary, category, location, email_contact, employer_id, created_at, expiry_date, company_name, employment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)',
      [title || '', jobInfo || '', jobPositionId || null, jobRequirements || '', benefits || '', salary || 0, category || '', location || '', emailContact || '', employerId, expiry_date || null, company_name || '', employmentType || '']
    );
    res.status(201).json({ message: 'Job posted successfully', insertId: result.insertId });
  } catch (error) {
    console.error('Error posting job:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(500).json({ message: 'Employer ID not found in employers table' });
    }
    res.status(500).json({ message: 'Error posting job' });
  }
});

// Thêm route PUT /:id để cập nhật công việc
router.put('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Received token for update:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { id } = req.params;
  const { title, jobInfo, jobPositionId, jobRequirements, benefits, salary, category, location, emailContact, expiry_date, company_name, employmentType } = req.body;
  console.log('Received update data:', req.body);

  if (!title || !jobInfo || !jobRequirements || !benefits || !salary || !category || !location || !emailContact) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;

    // Kiểm tra xem job có thuộc về employer này không
    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (job.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or job not found' });
    }

    await pool.query(
      'UPDATE jobposts SET title = ?, job_info = ?, job_position_id = ?, job_requirements = ?, benefits = ?, salary = ?, category = ?, location = ?, email_contact = ?, expiry_date = ?, company_name = ?, employment_type = ? WHERE id = ?',
      [title || '', jobInfo || '', jobPositionId || null, jobRequirements || '', benefits || '', salary || 0, category || '', location || '', emailContact || '', expiry_date || null, company_name || '', employmentType || '', id]
    );

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Error updating job:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Các route khác giữ nguyên
router.get('/job-positions', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT jp.id, jp.name FROM job_positions jp JOIN categories c ON jp.category_id = c.id';
    const params = [];
    if (category) {
      query += ' WHERE c.name = ?';
      params.push(category);
    }
    console.log('Executing query:', query, 'with params:', params);
    const [positions] = await pool.query(query, params);
    console.log('Fetched job positions:', positions);
    if (positions.length === 0) {
      console.log('No positions found for category:', category);
    }
    res.json(positions);
  } catch (error) {
    console.error('Error fetching job positions:', error);
    res.status(500).json({ message: 'Error fetching job positions' });
  }
});

// Lấy danh sách jobposts kèm số lượng yêu thích
router.get('/', async (req, res) => {
  try {
    const { category, location, salary, minFavorite } = req.query;

    let query = `
      SELECT jp.*,
        (SELECT COUNT(*) FROM favorites f WHERE f.jobpost_id = jp.id) AS favorite_count
      FROM jobposts jp
      WHERE status = "approved" AND expiry_date > NOW()
    `;
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }
    if (salary) {
      query += ' AND salary >= ?';
      params.push(parseFloat(salary));
    }
    if (minFavorite) {
      query += ' HAVING favorite_count >= ?';
      params.push(parseInt(minFavorite));
    }

    const [jobs] = await pool.query(query, params);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});




router.get('/my-jobs', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;
    const [jobs] = await pool.query('SELECT * FROM jobposts WHERE employer_id = ?', [employerId]);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [job] = await pool.query(
      `SELECT jp.*, 
        (SELECT COUNT(*) FROM favorites f WHERE f.jobpost_id = jp.id) AS favorite_count
       FROM jobposts jp
       WHERE jp.id = ?`,
      [id]
    );

    if (job.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job[0]);
  } catch (error) {
    console.error('Error fetching job detail:', error);
    res.status(500).json({ message: 'Error fetching job detail' });
  }
});


router.delete('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { id } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;
    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (job.length === 0) return res.status(403).json({ message: 'Unauthorized or job not found' });
    await pool.query('DELETE FROM jobposts WHERE id = ?', [id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

router.post('/job-positions', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [categoryRow] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
    if (categoryRow.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }
    const categoryId = categoryRow[0].id;

    const [result] = await pool.query(
      'INSERT INTO job_positions (category_id, name) VALUES (?, ?)',
      [categoryId, name]
    );
    res.status(201).json({ message: 'Job position added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding job position:', error);
    res.status(500).json({ message: 'Error adding job position' });
  }
});

router.get('/job-positions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [position] = await pool.query('SELECT name FROM job_positions WHERE id = ?', [id]);
    if (position.length === 0) {
      return res.status(404).json({ message: 'Job position not found' });
    }
    res.json({ name: position[0].name });
  } catch (error) {
    console.error('Error fetching job position:', error);
    res.status(500).json({ message: 'Error fetching job position' });
  }
});

// Thêm vào cuối file jobposts.js
router.get('/:id/applications', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Received token for applications:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;

    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (job.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or job not found' });
    }

    const [applications] = await pool.query(
      'SELECT a.id, a.candidate_name, a.email, a.phone, a.skills, a.introduction, a.cv_path AS resume_url, a.status FROM applications a WHERE a.jobpost_id = ?',
      [id]
    );
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.put('/:id/applications/:applicationId/approve', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { id, applicationId } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;

    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (job.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or job not found' });
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ? AND jobpost_id = ?', ['approved', applicationId, id]); // Thay job_id thành jobpost_id
    res.json({ message: 'Application approved' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Error approving application' });
  }
});

router.put('/:id/applications/:applicationId/reject', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { id, applicationId } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [decoded.id]);
    if (employer.length === 0) {
      return res.status(400).json({ message: 'No employer record found for this user' });
    }
    const employerId = employer[0].id;

    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (job.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or job not found' });
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ? AND jobpost_id = ?', ['rejected', applicationId, id]); // Thay job_id thành jobpost_id
    res.json({ message: 'Application rejected' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Error rejecting application' });
  }
});

router.get('/admin', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /jobposts/admin:', decoded); // Log để debug
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [jobPosts] = await pool.query('SELECT * FROM jobposts');
    if (!jobPosts.length) return res.status(404).json({ message: 'No job posts found' });
    res.json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all job posts' });
  }
});

// Admin cập nhật trạng thái bài đăng
// Admin cập nhật trạng thái
router.put('/admin/:id/status', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Body nhận được khi duyệt:', req.body);
    const { status } = req.body;
    if (!status || !['approved', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    

    const [result] = await pool.query(
      'UPDATE jobposts SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating job post status:', error);
    res.status(500).json({ message: 'Error updating job post status' });
  }
});


// Admin xóa bài đăng
router.delete('/admin/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [result] = await pool.query('DELETE FROM jobposts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Job post not found' });

    res.json({ message: 'Job post deleted successfully' });
  } catch (error) {
    console.error('Error deleting job post:', error);
    res.status(500).json({ message: 'Error deleting job post' });
  }
});




module.exports = router;