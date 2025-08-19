const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

router.get('/count', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM categories');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching categories count:', error);
    res.status(500).json({ message: 'Error fetching categories count' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const [existing] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
    if (existing.length > 0) return res.status(400).json({ message: 'Category already exists' });

    await pool.query('INSERT INTO categories (name, created_at) VALUES (?, NOW())', [name]);
    res.status(201).json({ message: 'Category added successfully' });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Error adding category' });
  }
});

// Cập nhật danh mục theo ID
router.put('/:id', async (req, res) => {
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

    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'Category updated successfully' });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});


module.exports = router;