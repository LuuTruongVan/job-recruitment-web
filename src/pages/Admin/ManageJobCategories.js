import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/css/AdminResponsive.css';

const ManageJobCategories = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = () => {
    axios.get('/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditedCategory({ name: category.name });
  };

  const handleSave = (id) => {
    const token = localStorage.getItem('admin_token');
    axios.put(`/categories/${id}`, editedCategory, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setCategories(categories.map(c => c.id === id ? { ...c, ...editedCategory } : c));
        setEditingId(null);
      })
      .catch(error => console.error('Error updating category:', error));
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      const token = localStorage.getItem('admin_token');
      axios.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => setCategories(categories.filter(c => c.id !== id)))
        .catch(error => console.error('Error deleting category:', error));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post('/categories', { name: newCategoryName.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-container">
      <h2>Quản lý danh mục</h2>

      <form
        onSubmit={handleAddCategory}
        className="filter-container"
      >
        <Form.Control
          placeholder="Tìm theo tên danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <Form.Control
          placeholder="Nhập tên danh mục mới..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="filter-input"
        />
        <Button variant="primary" type="submit">Thêm</Button>
      </form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(category => (
            <tr key={category.id}>
              <td data-label="ID">{category.id}</td>
              <td data-label="Tên danh mục">
                {editingId === category.id ? (
                  <Form.Control
                    value={editedCategory.name}
                    onChange={(e) => setEditedCategory({ name: e.target.value })}
                  />
                ) : (
                  category.name
                )}
              </td>
              <td data-label="Hành động">
                {editingId === category.id ? (
                  <Button variant="success" onClick={() => handleSave(category.id)}>Lưu</Button>
                ) : (
                  <Button variant="warning" onClick={() => handleEdit(category)}>Sửa</Button>
                )}{' '}
                <Button variant="danger" onClick={() => handleDelete(category.id)}>Xóa</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ManageJobCategories;