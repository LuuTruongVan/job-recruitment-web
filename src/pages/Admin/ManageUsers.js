import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import '../../assets/css/AdminResponsive.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [roleFilter, setRoleFilter] = useState('');
  const [searchName, setSearchName] = useState('');

  const token = localStorage.getItem('admin_token');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/users/get-all', { headers });
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi tải người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [headers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/users/add', { ...newUser, role: 'admin' }, { headers });
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'admin' });

      const response = await axios.get('http://localhost:3001/users/get-all', { headers });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thêm người dùng');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`http://localhost:3001/users/delete/${id}`, { headers });
      const response = await axios.get('http://localhost:3001/users/get-all', { headers });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi xóa người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchRole = roleFilter ? user.role === roleFilter : true;
    const matchName = searchName ? user.name?.toLowerCase().includes(searchName.toLowerCase()) : true;
    return matchRole && matchName;
  });

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="table-container">
      <h2>Quản lý người dùng</h2>

      <div className="filter-container">
        <Form.Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả quyền</option>
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </Form.Select>
        <Form.Control
          type="text"
          placeholder="Tìm theo tên..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="filter-input"
        />
      </div>

      <Button variant="primary" onClick={() => setShowAddModal(true)} className="add-button">
        Thêm người dùng (Admin)
      </Button>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} className="centered-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Admin mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Form.Group>
            <input type="hidden" name="role" value="admin" />
            <Button variant="primary" type="submit">Thêm</Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="cancel-button">
              Hủy
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td data-label="ID">{user.id}</td>
              <td data-label="Tên">{user.name || ''}</td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Role">{user.role}</td>
              <td data-label="Hành động">
                {user.role !== 'admin' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Xóa
                  </Button>
                ) : (
                  <span className="no-action">Không thể xóa admin</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {filteredUsers.length === 0 && <p>Không tìm thấy người dùng.</p>}
    </div>
  );
};

export default ManageUsers;