import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ManageJobCategories = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState({ name: '' });

  useEffect(() => {
    axios.get('/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditedCategory({ name: category.name });
  };
  const handleSave = (id) => {
    const token = localStorage.getItem('admin_token'); // Lấy token admin
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
      axios.delete(`/categories/${id}`)
        .then(() => setCategories(categories.filter(c => c.id !== id)))
        .catch(error => console.error('Error deleting category:', error));
    }
  };

  return (
    <div>
      <h2>Quản lý danh mục</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>
                {editingId === category.id ? (
                  <Form.Control
                    value={editedCategory.name}
                    onChange={(e) => setEditedCategory({ name: e.target.value })}
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
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