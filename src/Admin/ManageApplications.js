import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (token) {
      axios.get('/applications/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log('Applications response:', response.data);
          setApplications(response.data);
        })
        .catch(error => console.error('Error fetching applications:', error.response?.data || error.message));
    } else {
      console.log('No admin token found');
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

  return (
    <div>
      <h2>Quản lý ứng tuyển</h2>
      <Table striped bordered hover>
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
          {applications.map(app => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.candidate_name || app.user_email}</td>
              <td>{app.jobpost_title}</td>
              <td>{app.status}</td>
              <td>
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