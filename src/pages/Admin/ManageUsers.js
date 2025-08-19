import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
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
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <div>
      <h2>Quản lý người dùng</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <Form.Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ width: '200px' }}
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
          style={{ width: '250px' }}
        />
      </div>

      <Button variant="primary" onClick={() => setShowAddModal(true)} style={{ marginBottom: '20px' }}>
        Thêm người dùng (Admin)
      </Button>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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

            {/* Role mặc định admin */}
            <input type="hidden" name="role" value="admin" />

            <Button variant="primary" type="submit">Thêm</Button>
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
  {filteredUsers.map(user => (
    <tr key={user.id}>
      <td data-label="ID">{user.id}</td>
      <td data-label="Tên">{user.name || ''}</td>
      <td data-label="Email">{user.email}</td>
      <td data-label="Role">{user.role}</td>
      <td data-label="Hành động">
        {user.role !== 'admin' ? (
          <button
            onClick={() => handleDeleteUser(user.id)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Xóa
          </button>
        ) : (
          <span style={{ color: 'gray', fontStyle: 'italic' }}></span>
        )}
      </td>
    </tr>
  ))}
</tbody>

      </table>
      {filteredUsers.length === 0 && <p>Không tìm thấy người dùng.</p>}
    </div>
  );
};

export default ManageUsers;
