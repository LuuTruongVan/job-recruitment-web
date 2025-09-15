const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const applicationsController = require('../controllers/applicationsController');


const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/add', upload.single('cv'), applicationsController.addApplication);
router.get('/get', applicationsController.getUserApplications);


router.put('/update/:id', applicationsController.updateApplication);
router.put('/jobposts/:jobId/applications/:appId/approve', applicationsController.approveApplication);
router.put('/jobposts/:jobId/applications/:appId/reject', applicationsController.rejectApplication);


router.get('/get-all', applicationsController.getAllApplications);


router.delete('/delete/:id', applicationsController.deleteApplication);


router.get('/count', applicationsController.countApplications);

module.exports = router;
