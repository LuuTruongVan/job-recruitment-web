import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import '../assets/css/JobManagementDetail.css';

const JobManagementDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isExpired = (expiryDateString) => {
    if (!expiryDateString) return false;
    const expiryDate = new Date(expiryDateString);
    const now = new Date();
    expiryDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return expiryDate < now;
  };

  useEffect(() => {
    const token = localStorage.getItem('employer_token');
    axios.get(`/jobposts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      const jobData = response.data;
      if (jobData.job_position_id) {
        try {
          const positionResponse = await axios.get(`/jobposts/job-positions/${jobData.job_position_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          jobData.job_position = positionResponse.data.name || 'Chưa có vị trí';
        } catch {
          jobData.job_position = 'Chưa có vị trí';
        }
      } else {
        jobData.job_position = 'Chưa có vị trí';
      }
      setJob(jobData);

      try {
        const appsResponse = await axios.get(`/jobposts/${id}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(appsResponse.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    }).catch(() => {
      setError('Không thể tải thông tin công việc.');
    });
  }, [id]);

  const handleApprove = async (applicationId) => {
    const token = localStorage.getItem('employer_token');
    try {
      await axios.put(`/applications/jobposts/${id}/applications/${applicationId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: 'approved' } : app
      ));
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleReject = async (applicationId) => {
    const token = localStorage.getItem('employer_token');
    try {
      await axios.put(`/applications/jobposts/${id}/applications/${applicationId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: 'rejected' } : app
      ));
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  if (error) return <p>{error}</p>;
  if (!job) return <p>Đang tải...</p>;

  const expired = isExpired(job.expiry_date);

  return (
    <div className="job-detail-container">
      <div className="job-detail-layout">
        <div className="job-content">
          <div className="job-header">
            <div>
              <h2>{job.title}</h2>
              <p className="company-name">{job.company_name || 'Chưa có'}</p>
            </div>
            {expired && (
              <p className="expired-notice">Bài đăng đã hết hạn</p>
            )}
          </div>

          <div className="job-info-grid">
            <div>
              <p><strong>Vị trí:</strong> {job.job_position}</p>
              <p><strong>Hình thức:</strong> {job.employment_type || 'Chưa có'}</p>
              <p>
                <strong>Lương:</strong>{' '}
                {job.salary
                  ? `${parseInt(job.salary, 10).toLocaleString('vi-VN')} VND`
                  : 'Chưa có'}
              </p>
              <p><strong>Địa chỉ:</strong> {job.location}</p>
            </div>
            <div>
              <p><strong>Email liên hệ:</strong> {job.email_contact || 'Chưa có email'}</p>
              <p><strong>Ngày đăng:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
              <p><strong>Hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</p>
              <p><strong>Phân loại:</strong> {job.category}</p>
            </div>
          </div>

          <div className="job-details-sections">
            <div className="job-detail-box">
              <h5>Thông tin công việc</h5>
              <p style={{ whiteSpace: 'pre-line' }}>{job.job_info || 'Chưa có thông tin'}</p>
            </div>
            <div className="job-detail-box">
              <h5>Yêu cầu công việc</h5>
              <p style={{ whiteSpace: 'pre-line' }}>{job.job_requirements || 'Chưa có yêu cầu'}</p>
            </div>
            <div className="job-detail-box">
              <h5>Quyền lợi</h5>
              <p style={{ whiteSpace: 'pre-line' }}>{job.benefits || 'Chưa có quyền lợi'}</p>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-secondary" onClick={() => navigate('/manage-posts')}>
              Quay lại
            </Button>
          </div>
        </div>

        <div className="applications-content">
          {applications.length > 0 ? (
            <div className="job-detail-box">
              <h5>Danh sách ứng viên</h5>
              <Table striped bordered hover className="responsive-table">
                <thead>
                  <tr>
                    <th>Tên ứng viên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Kỹ năng</th>
                    <th>Giới thiệu</th>
                    <th>CV</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td data-label="Tên ứng viên">{app.candidate_name || 'Không có tên'}</td>
                      <td data-label="Email">{app.email || 'Không có email'}</td>
                      <td data-label="Số điện thoại">{app.phone || 'Không có số điện thoại'}</td>
                      <td data-label="Kỹ năng">{app.skills || 'Không có kỹ năng'}</td>
                      <td data-label="Giới thiệu">{app.introduction || 'Không có giới thiệu'}</td>
                      <td data-label="CV">
                        {app.resume_url || app.cv_path ? (
                          <a
                            href={`http://localhost:3000${app.resume_url || app.cv_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem CV
                          </a>
                        ) : 'Không có CV'}
                      </td>
                      <td data-label="Trạng thái">{app.status || 'pending'}</td>
                      <td data-label="Hành động">
                        {(app.status !== 'approved' && app.status !== 'rejected') && (
                          <>
                            <Button
                              variant="success"
                              onClick={() => handleApprove(app.id)}
                              className="me-2 action-btn"
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleReject(app.id)}
                              className="action-btn"
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="job-detail-box">
              <p>Chưa có ứng viên nào ứng tuyển.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagementDetail;