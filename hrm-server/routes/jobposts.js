// routes/jobposts.js
const express = require('express');
const router = express.Router();
const JobpostsController = require('../controllers/jobpostsController');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/job_images')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Public routes
router.get('/count', JobpostsController.count);
router.get('/', JobpostsController.getAll);
router.get('/admin', JobpostsController.getAllForAdmin);
router.get('/job-positions', JobpostsController.getJobPositions);

// Authenticated routes
router.get('/my-jobs', JobpostsController.getMyJobs);
router.post('/', upload.single('job_image'), JobpostsController.create);
router.put('/:id', JobpostsController.update);
router.delete('/:id', JobpostsController.delete);
router.get('/my-jobs', JobpostsController.getMyJobs);
router.post('/job-positions', JobpostsController.addJobPosition);
router.get('/:id/applications', JobpostsController.getApplications);
router.put('/:id/applications/:applicationId/approve', JobpostsController.approveApplication);
router.put('/:id/applications/:applicationId/reject', JobpostsController.rejectApplication);
router.get('/job-positions/:id', JobpostsController.getJobPositionById);

// Admin routes
router.put('/admin/:id/status', JobpostsController.adminUpdateStatus);
router.delete('/admin/:id', JobpostsController.adminDelete);
router.get('/:id', JobpostsController.getById);
// Admin: lấy tất cả jobposts


module.exports = router;
