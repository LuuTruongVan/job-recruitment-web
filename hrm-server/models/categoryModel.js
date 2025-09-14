// models/categoryModel.js
const pool = require('../db');

const CategoryModel = {
  getAll: () => pool.query('SELECT * FROM categories'),

  getCount: () => pool.query('SELECT COUNT(*) AS count FROM categories'),

  findByName: (name) => pool.query('SELECT * FROM categories WHERE name = ?', [name]),

  findById: (id) => pool.query('SELECT * FROM categories WHERE id = ?', [id]),

  create: (name) => pool.query(
    'INSERT INTO categories (name, created_at) VALUES (?, NOW())',
    [name]
  ),

  update: (id, name) => pool.query(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name, id]
  ),
  delete: async (id) => {
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  },
};

module.exports = CategoryModel;
