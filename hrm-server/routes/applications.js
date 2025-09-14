const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const applicationsController = require('../controllers/applicationsController');

// Multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Candidate applies
router.post('/add', upload.single('cv'), applicationsController.addApplication);
router.get('/get', applicationsController.getUserApplications);

// Employer updates application
router.put('/update/:id', applicationsController.updateApplication);
router.put('/jobposts/:jobId/applications/:appId/approve', applicationsController.approveApplication);
router.put('/jobposts/:jobId/applications/:appId/reject', applicationsController.rejectApplication);

// Admin
router.get('/get-all', applicationsController.getAllApplications);

// Delete
router.delete('/delete/:id', applicationsController.deleteApplication);

// Count
router.get('/count', applicationsController.countApplications);

module.exports = router;
