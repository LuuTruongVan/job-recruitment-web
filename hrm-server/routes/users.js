const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');

// Middleware auth
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};

// Routes
router.post('/add', userController.addUser);
router.post('/get', userController.getUser);

router.put('/update/:id/toggle', authenticateToken, isAdmin, userController.toggleUserStatus);

router.get('/get-profile', authenticateToken, userController.getProfile);
router.put('/update-profile', authenticateToken, userController.updateProfile);
router.put('/change-password', authenticateToken, userController.changePassword);

router.get('/candidate-profile', authenticateToken, userController.getCandidateProfile);
router.get('/employer-profile', authenticateToken, userController.getEmployerProfile);

router.get('/get-all', authenticateToken, isAdmin, userController.getAllUsers);
router.delete('/delete/:id', authenticateToken, isAdmin, userController.deleteUser);

router.get('/verify-email', userController.verifyEmail);
router.post('/verify-otp', userController.verifyOtp);

router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-otp', userController.verifyResetOtp);
router.post('/reset-password', userController.resetPassword);

module.exports = router;