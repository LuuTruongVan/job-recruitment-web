// services/categoryService.js
const CategoryModel = require('../models/categoryModel');

const CategoryService = {
  getAllCategories: async () => {
    const [categories] = await CategoryModel.getAll();
    return categories;
  },

  getCategoryCount: async () => {
    const [result] = await CategoryModel.getCount();
    return result[0].count;
  },

  addCategory: async (name) => {
    const [existing] = await CategoryModel.findByName(name);
    if (existing.length > 0) {
      throw new Error('Category already exists');
    }
    await CategoryModel.create(name);
    return { message: 'Category added successfully' };
  },

  updateCategory: async (id, name) => {
    const [existing] = await CategoryModel.findById(id);
    if (existing.length === 0) {
      throw new Error('Category not found');
    }
    await CategoryModel.update(id, name);
    return { message: 'Category updated successfully' };
  },
  getById: async (id) => {
    const [category] = await CategoryModel.findById(id);
    return category.length > 0 ? category[0] : null;
  },
  delete: (id) => CategoryModel.delete(id),
};

module.exports = CategoryService;
