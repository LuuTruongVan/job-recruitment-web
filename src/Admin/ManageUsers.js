import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'candidate' });
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await axios.get('http://localhost:3001/users/get-all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API response:', response.data); // Thêm log để kiểm tra
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching users');
        console.error('Error fetching users:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post('http://localhost:3001/users/add', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'candidate' });
      const response = await axios.get('http://localhost:3001/users/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding user');
      console.error('Error adding user:', err.response?.data);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`http://localhost:3001/users/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const response = await axios.get('http://localhost:3001/users/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
      console.error('Error deleting user:', err.response?.data);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      <Button variant="primary" onClick={() => setShowAddModal(true)} style={{ marginBottom: '20px' }}>
        Thêm người dùng
      </Button>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm người dùng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddUser}>
            <Form.Group controlId="formName" style={{ marginBottom: '15px' }}>
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmail" style={{ marginBottom: '15px' }}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPassword" style={{ marginBottom: '15px' }}>
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formRole" style={{ marginBottom: '15px' }}>
              <Form.Label>Quyền</Form.Label>
              <Form.Control
                as="select"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Thêm
            </Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} style={{ marginLeft: '10px' }}>
              Hủy
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tên</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ border: '1px solid #ddd' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name || ''}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#ff4444', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p>Không có người dùng nào.</p>}
    </div>
  );
};

export default ManageUsers;