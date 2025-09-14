const express = require('express');
const router = express.Router();
const EmployersController = require('../controllers/employersController');

// Public route
router.get('/public/:id', EmployersController.getPublicEmployer);

// Admin routes
router.get('/get-all', EmployersController.getAllEmployers);
router.get('/count', EmployersController.countEmployers);

// Employer routes
router.post('/add', EmployersController.addEmployer);
router.put('/update', EmployersController.updateEmployer);
router.delete('/delete/:id', EmployersController.deleteEmployer);

// By user
router.get('/by-user/:userId', EmployersController.getEmployerByUser);

module.exports = router;
