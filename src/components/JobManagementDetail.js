import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import '../componentCss/JobDetail.css';

const JobManagementDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hàm kiểm tra bài đăng có hết hạn chưa (chỉ so sánh ngày, không so giờ phút giây)
  const isExpired = (expiryDateString) => {
    if (!expiryDateString) return false;
    const expiryDate = new Date(expiryDateString);
    const now = new Date();

    // reset giờ phút giây cho so sánh chỉ ngày
    expiryDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return expiryDate < now;
  };

  useEffect(() => {
    const token = localStorage.getItem('employer_token');
    console.log('Fetching job with id:', id, 'Token:', token);
    axios.get(`/jobposts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      const jobData = response.data;
      console.log('Job data:', jobData);
      if (jobData.job_position_id) {
        try {
          const positionResponse = await axios.get(`/jobposts/job-positions/${jobData.job_position_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          jobData.job_position = positionResponse.data.name || 'Chưa có vị trí';
        } catch (error) {
          console.error('Error fetching job position:', error);
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
        console.log('Applications data:', appsResponse.data);
        setApplications(appsResponse.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    }).catch(error => {
      console.error('Error fetching job detail:', error);
      setError('Không thể tải thông tin công việc. Vui lòng kiểm tra console.');
    });
  }, [id]);

  const handleApprove = async (applicationId) => {
    const token = localStorage.getItem('employer_token');
    try {
      await axios.put(`/jobposts/${id}/applications/${applicationId}/approve`, {}, {
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
      await axios.put(`/jobposts/${id}/applications/${applicationId}/reject`, {}, {
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
    <div className="job-detail-container" style={{ maxWidth: '100%', width: '1200px', margin: '0 auto' }}>
      <div className="job-detail-layout">
        <div className="job-content">
          <p><strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}</p>
          <h2>{job.title}</h2>
          <p><strong>Vị trí công việc:</strong> {job.job_position || 'Chưa có vị trí'}</p>

          {/* Hiển thị cảnh báo hết hạn */}
          {expired && (
            <p style={{ color: 'red', fontWeight: 'bold' }}>Bài đăng đã hết hạn</p>
          )}

          <div>
            <strong>Thông tin công việc:</strong>
            <div style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>
              {job.job_info || 'Chưa có thông tin'}
            </div>
          </div>
          <div>
            <strong>Yêu cầu công việc:</strong>
            <div style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>
              {job.job_requirements || 'Chưa có yêu cầu'}
            </div>
          </div>
          <div>
            <strong>Quyền lợi:</strong>
            <div style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>
              {job.benefits || 'Chưa có quyền lợi'}
            </div>
          </div>

          <p><strong>Lương:</strong> {job.salary} VND</p>
          <p><strong>Phân loại:</strong> {job.category}</p>
          <p><strong>Địa chỉ:</strong> {job.location}</p>
          <p><strong>Email liên hệ:</strong> {job.email_contact || 'Chưa có email'}</p>
          <p><strong>Ngày đăng:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
          <p><strong>Ngày hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</p>

          {/* Nếu bài đăng hết hạn thì không cho sửa / không hiện nút (nếu bạn có nút sửa) */}
          {!expired && (
            <Button variant="secondary" onClick={() => navigate('/manage-posts')} className="mt-3">
              Quay lại
            </Button>
          )}
        </div>
        <div className="applications-content">
          {applications.length > 0 ? (
            <div className="mt-4">
              <h3>Danh sách ứng viên</h3>
              <Table striped bordered hover>
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
                      <td>{app.candidate_name || 'Không có tên'}</td>
                      <td>{app.email || 'Không có email'}</td>
                      <td>{app.phone || 'Không có số điện thoại'}</td>
                      <td>{app.skills || 'Không có kỹ năng'}</td>
                      <td>{app.introduction || 'Không có giới thiệu'}</td>
                      <td>
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
                      <td>{app.status || 'pending'}</td>
                      <td>
                        {/* Nếu đã duyệt hoặc từ chối thì không hiện nút */}
                        {(app.status !== 'approved' && app.status !== 'rejected') && (
                          <>
                            <Button variant="success" onClick={() => handleApprove(app.id)} className="me-2">
                              Duyệt
                            </Button>
                            <Button variant="danger" onClick={() => handleReject(app.id)}>
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
            <p>Chưa có ứng viên nào ứng tuyển.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagementDetail;
