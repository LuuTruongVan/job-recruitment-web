// controllers/jobpostsController.js
const pool = require("../db");

const JobpostsService = require('../services/jobpostsService');
const JobpostsModel = require('../models/jobpostsModel');
const jwt = require('jsonwebtoken');

const JobpostsController = {

  // Đếm số jobposts
  count: async (req, res) => {
    try {
      const count = await JobpostsModel.count();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching jobposts count' });
    }
  },

  // Lấy tất cả jobposts (có thể filter)
  getAll: async (req, res) => {
    try {
      const { category, location, salary, minFavorite } = req.query;
      let jobs = await JobpostsModel.getAll();
  
      if (category) jobs = jobs.filter(job => job.category === category);
      if (location) jobs = jobs.filter(job => job.location === location);
      if (salary) jobs = jobs.filter(job => job.salary >= parseFloat(salary));
      if (minFavorite) jobs = jobs.filter(job => job.favorite_count >= parseInt(minFavorite));
  
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
  },
  

  // Lấy job theo ID
  getById: async (req, res) => {
    try {
      const job = await JobpostsModel.getById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching job detail' });
    }
  },

  // Lấy danh sách job của employer hiện tại
  getMyJobs: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Lấy employer_id từ bảng employers
      const [employer] = await pool.query(
        'SELECT id FROM employers WHERE user_id = ?',
        [decoded.id]
      );
  
      if (employer.length === 0) {
        return res.status(400).json({ message: 'No employer record found for this user' });
      }
  
      const employerId = employer[0].id;
  
      // Lấy danh sách jobposts của employer này
      const jobs = await JobpostsModel.getByEmployerId(employerId);
      res.json(jobs);
  
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      res.status(500).json({ message: 'Error fetching user jobs' });
    }
  },

  // Tạo job mới
  create: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const insertId = await JobpostsService.createJobPost(req.body, decoded.id, req.app.get('io'));
      res.status(201).json({ message: 'Job posted successfully', insertId });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Error posting job' });
    }
  },

  // Cập nhật job
  update: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await JobpostsService.updateJobPost(req.params.id, req.body, decoded.id);
      res.json({ message: 'Job updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Error updating job' });
    }
  },

  // Xóa job
  delete: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await JobpostsService.deleteJobPost(req.params.id, decoded.id);
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Error deleting job' });
    }
  },

  // Job positions
  getJobPositions: async (req, res) => {
    try {
      const positions = await JobpostsModel.getJobPositions(req.query.category);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching job positions' });
    }
  },

  addJobPosition: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Missing required fields' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [categoryRow] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRow.length === 0) return res.status(400).json({ message: 'Category not found' });

      const insertId = await JobpostsModel.addJobPosition(name, categoryRow[0].id);
      res.status(201).json({ message: 'Job position added successfully', id: insertId });
    } catch (error) {
      res.status(500).json({ message: 'Error adding job position' });
    }
  },

  // Ứng tuyển: lấy danh sách applications
  getApplications: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const applications = await JobpostsModel.getApplications(req.params.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  },

  // Approve/Reject applications
  approveApplication: async (req, res) => {
    try {
      await JobpostsModel.updateApplicationStatus(req.params.applicationId, req.params.id, 'approved');
      res.json({ message: 'Application approved' });
    } catch (error) {
      res.status(500).json({ message: 'Error approving application' });
    }
  },

  rejectApplication: async (req, res) => {
    try {
      await JobpostsModel.updateApplicationStatus(req.params.applicationId, req.params.id, 'rejected');
      res.json({ message: 'Application rejected' });
    } catch (error) {
      res.status(500).json({ message: 'Error rejecting application' });
    }
  },

  // Admin cập nhật trạng thái
  adminUpdateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const result = await JobpostsModel.updateStatusAdmin(req.params.id, status);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Job post not found' });
      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating job post status' });
    }
  },

  // Admin xóa job
  adminDelete: async (req, res) => {
    try {
      const result = await JobpostsModel.delete(req.params.id);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Job post not found during deletion' });
      res.json({ message: 'Job post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting job post' });
    }
  },
  getJobPositionById: async (req, res) => {
    try {
      const { id } = req.params;
      const position = await JobpostsModel.getJobPositionById(id);
      if (!position) return res.status(404).json({ message: 'Job position not found' });
      res.json(position);
    } catch (error) {
      console.error('Error fetching job position:', error);
      res.status(500).json({ message: 'Error fetching job position' });
    }
  },
  getAllForAdmin: async (req, res) => {
    try {
      const [jobPosts] = await pool.query(`
        SELECT jp.*, 
               (SELECT COUNT(*) FROM favorites f WHERE f.jobpost_id = jp.id) AS favorite_count
        FROM jobposts jp
        ORDER BY jp.created_at DESC
      `);
      res.json(jobPosts);
    } catch (error) {
      console.error('Error fetching job posts for admin:', error);
      res.status(500).json({ message: 'Error fetching job posts for admin' });
    }
  },
  

};


  

module.exports = JobpostsController;
