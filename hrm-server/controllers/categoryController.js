// controllers/categoryController.js
const jwt = require('jsonwebtoken');
const CategoryService = require('../services/categoryService');

const CategoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  getCategoriesCount: async (req, res) => {
    try {
      const count = await CategoryService.getCategoryCount();
      res.json({ count });
    } catch (error) {
      console.error('Error fetching categories count:', error);
      res.status(500).json({ message: 'Error fetching categories count' });
    }
  },

  addCategory: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const result = await CategoryService.addCategory(name);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ message: error.message });
    }
  },

  updateCategory: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const result = await CategoryService.updateCategory(id, name);
      res.json(result);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      const category = await CategoryService.getById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await CategoryService.delete(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Error deleting category" });
    }
  },
};

module.exports = CategoryController;
