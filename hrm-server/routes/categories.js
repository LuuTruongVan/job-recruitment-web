// routes/category.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Public routes
router.get('/', CategoryController.getCategories);
router.get('/count', CategoryController.getCategoriesCount);
router.delete('/:id', CategoryController.delete);
// Admin routes
router.post('/', CategoryController.addCategory);
router.put('/:id', CategoryController.updateCategory);

module.exports = router;
