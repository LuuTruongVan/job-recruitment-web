import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/css/AdminResponsive.css';
const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (token) {
      axios.get('/applications/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setApplications(response.data);
        })
        .catch(error => console.error('Error fetching applications:', error.response?.data || error.message));
    }
  }, [token]);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ứng tuyển này?')) {
      axios.delete(`/applications/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => setApplications(applications.filter(a => a.id !== id)))
        .catch(error => console.error('Error deleting application:', error.response?.data || error.message));
    }
  };

  const filteredApps = applications.filter(app => {
    const nameMatch = app.candidate_name?.toLowerCase().includes(searchName.toLowerCase()) ||
                      app.user_email?.toLowerCase().includes(searchName.toLowerCase());
    const statusMatch = filterStatus ? app.status === filterStatus : true;
    return nameMatch && statusMatch;
  });

  return (
    <div>
      <h2>Quản lý ứng tuyển</h2>

      {/* Bộ lọc */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <Form.Control
          type="text"
          placeholder="Tìm theo tên "
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: '250px' }}
        />
        <Form.Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Đã từ chối</option>
        </Form.Select>
      </div>

      <Table striped bordered hover responsive>
  <thead>
    <tr>
      <th>ID</th>
      <th>Ứng viên</th>
      <th>Bài đăng</th>
      <th>Trạng thái</th>
      <th>Hành động</th>
    </tr>
  </thead>
  <tbody>
    {filteredApps.map(app => (
      <tr key={app.id}>
        <td data-label="ID">{app.id}</td>
        <td data-label="Ứng viên">{app.candidate_name || app.user_email}</td>
        <td data-label="Bài đăng">{app.jobpost_title}</td>
        <td data-label="Trạng thái">{app.status}</td>
        <td data-label="Hành động">
          <Button variant="danger" onClick={() => handleDelete(app.id)}>
            Xóa
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

    </div>
  );
};

export default ManageApplications;
