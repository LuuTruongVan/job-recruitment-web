import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import '../assets/css/ManageApplications.css';
import '../assets/css/JobDetail.css';


const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const candidateToken = localStorage.getItem('candidate_token');
    if (!candidateToken) {
      setError('Vui lòng đăng nhập với vai trò ứng viên.');
      return;
    }

    axios.get('http://localhost:3000/applications/get', {
      headers: { Authorization: `Bearer ${candidateToken}` }
    })
      .then((response) => {
        setApplications(response.data);
      })
      .catch((error) => {
        console.error('Error fetching applications:', error.response?.status, error.response?.data || error.message);
        setError('Không thể tải danh sách ứng tuyển.');
      });
  }, []);

  const translateStatus = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'pending':
      default:
        return 'Đang chờ';
    }
  };

  return (
    <div className="job-detail-container" style={{ maxWidth: '100%', width: '1200px', margin: '0 auto' }}>
      <div className="applications-content">
        <h3>Danh sách ứng tuyển của bạn</h3>
        {error ? (
          <p>{error}</p>
        ) : applications.length > 0 ? (
          <div className="mt-4">
            <Table striped bordered hover className="responsive-table">
              <thead>
                <tr>
                  <th>Tiêu đề công việc</th>
                  <th>Tên ứng viên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>CV</th>
                  <th>Ứng tuyển ngày</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td data-label="Tiêu đề công việc">{app.title || 'Chưa có tiêu đề'}</td>
                    <td data-label="Tên ứng viên">{app.candidate_name || 'Không có tên'}</td>
                    <td data-label="Email">{app.email || 'Không có email'}</td>
                    <td data-label="Số điện thoại">{app.phone || 'Không có số điện thoại'}</td>
                    <td data-label="CV">
                      {app.cv_path ? (
                        <a href={`http://localhost:3000${app.cv_path}`} target="_blank" rel="noopener noreferrer">
                          Xem CV
                        </a>
                      ) : 'Không có CV'}
                    </td>
                    <td data-label="Ứng tuyển ngày">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Chưa có'}
                    </td>
                    <td data-label="Trạng thái">{translateStatus(app.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <p>Bạn chưa ứng tuyển vào công việc nào.</p>
        )}
        <Button variant="secondary" onClick={() => navigate('/home')} className="mt-3">
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default ManageApplications;
