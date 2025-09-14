const pool = require('../db');

const jwt = require('jsonwebtoken');
const ApplicationsModel = require('../models/applicationsModel');
const ApplicationsServices = require('../services/applicationsService');

exports.addApplication = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Only candidates can apply' });

    const { candidate_name, phone, email, address, skills, introduction, jobpost_id } = req.body;
    if (!candidate_name || !phone || !email || !address || !skills || !introduction || !jobpost_id)
      return res.status(400).json({ message: 'All fields are required except CV.' });

    const cvPath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!cvPath) return res.status(400).json({ message: 'CV file is required.' });

    const isDuplicate = await ApplicationsModel.checkDuplicateApplication(decoded.id, jobpost_id);
    if (isDuplicate) return res.status(400).json({ message: 'You have already applied for this job.' });

    const applicationId = await ApplicationsModel.createApplication({
      jobpost_id, user_id: decoded.id, candidate_name, phone, email, address, skills, introduction, cvPath
    });

    const io = req.app.get('io');
    await ApplicationsServices.notifyEmployer(io, jobpost_id, candidate_name);

    res.status(201).json({ message: 'Application added successfully', applicationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding application', error: err.message });
  }
};

exports.getUserApplications = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

    const applications = await ApplicationsModel.getApplicationsByUser(decoded.id);
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const { status, feedback } = req.body;

    const appInfo = await ApplicationsModel.getApplicationWithJobAndEmployer(id);
    if (!appInfo) return res.status(404).json({ message: 'Application not found' });

    const [employers] = await pool.query('SELECT user_id FROM employers WHERE id = ?', [appInfo.employer_id]);
    if (!employers.length || employers[0].user_id !== decoded.id) return res.status(403).json({ message: 'Unauthorized' });

    await ApplicationsModel.updateApplication(id, status, feedback);

    const io = req.app.get('io');
    await ApplicationsServices.notifyCandidate(io, appInfo.candidate_user_id, appInfo.title, status, feedback);

    res.json({ message: 'Application updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating application' });
  }
};

exports.approveApplication = async (req, res) => handleApproveReject(req, res, 'approved');
exports.rejectApplication = async (req, res) => handleApproveReject(req, res, 'rejected');

async function handleApproveReject(req, res, status) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

    const { jobId, appId } = req.params;

    const [job] = await pool.query('SELECT employer_id FROM jobposts WHERE id = ?', [jobId]);
    if (!job.length) return res.status(404).json({ message: 'Job post not found' });

    const [employers] = await pool.query('SELECT user_id FROM employers WHERE id = ?', [job[0].employer_id]);
    if (!employers.length || employers[0].user_id !== decoded.id) return res.status(403).json({ message: 'Unauthorized' });

    const appInfo = await ApplicationsModel.getApplicationWithJobAndEmployer(appId);
    if (!appInfo) return res.status(404).json({ message: 'Application not found' });

    await ApplicationsModel.updateApplication(appId, status);

    const io = req.app.get('io');
    await ApplicationsServices.notifyCandidate(io, appInfo.candidate_user_id, appInfo.title, status);

    res.json({ message: `Application ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error ${status} application` });
  }
}

exports.getAllApplications = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const applications = await ApplicationsModel.getAllApplications();
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all applications' });
  }
};

exports.deleteApplication = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;

    if (decoded.role === 'candidate') {
      const [application] = await pool.query('SELECT id FROM applications WHERE id = ? AND user_id = ?', [id, decoded.id]);
      if (!application.length) return res.status(404).json({ message: 'Application not found or unauthorized' });
      await ApplicationsModel.deleteApplication(id);
      return res.json({ message: 'Application deleted successfully' });
    }

    if (decoded.role === 'employer') {
      const [application] = await pool.query('SELECT j.employer_id FROM applications a JOIN jobposts j ON a.jobpost_id = j.id WHERE a.id = ?', [id]);
      if (!application.length) return res.status(404).json({ message: 'Application not found' });
      if (application[0].employer_id !== decoded.id) return res.status(403).json({ message: 'Unauthorized' });
      await ApplicationsModel.deleteApplication(id);
      return res.json({ message: 'Application deleted successfully' });
    }

    if (decoded.role === 'admin') {
      const [application] = await pool.query('SELECT id FROM applications WHERE id = ?', [id]);
      if (!application.length) return res.status(404).json({ message: 'Application not found' });
      await ApplicationsModel.deleteApplication(id);
      return res.json({ message: 'Application deleted successfully' });
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting application' });
  }
};

exports.countApplications = async (req, res) => {
  try {
    const count = await ApplicationsModel.countApplications();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching applications count' });
  }
};
