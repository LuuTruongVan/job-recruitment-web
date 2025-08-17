import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import '../componentCss/JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [formData, setFormData] = useState({
    candidate_name: '',
    phone: '',
    email: '',
    address: '',
    skills: '',
    introduction: '',
    cv: null
  });

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  const navigate = useNavigate();
  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token');

  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await axios.get(`/favorites/count/${id}`);
      return res.data.count || 0;
    } catch {
      return 0;
    }
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobResponse = await axios.get(`/jobposts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const jobData = jobResponse.data;
        console.log('Job data:', jobData);

        jobData.favorite_count = await fetchFavoriteCount();

        if (jobData.job_position_id) {
          try {
            const positionResponse = await axios.get(
              `/jobposts/job-positions/${jobData.job_position_id}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            jobData.job_position = positionResponse.data.name || 'Chưa có vị trí';
          } catch {
            jobData.job_position = 'Chưa có vị trí';
          }
        } else {
          jobData.job_position = 'Chưa có vị trí';
        }

        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job detail:', err);
        setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      }
    };

    const fetchUser = async () => {
      if (!token) return;
      try {
        const userResponse = await axios.get('/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        const favRes = await axios.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(favRes.data.some(fav => fav.id === parseInt(id)));
      } catch {}
    };

    fetchJob();
    fetchUser();
  }, [id, token, fetchFavoriteCount]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      return;
    }
    try {
      if (isFavorite) {
        await axios.delete(`/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
      } else {
        await axios.post(
          '/favorites',
          { jobpost_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      }
      const updatedCount = await fetchFavoriteCount();
      setJob(prev => ({ ...prev, favorite_count: updatedCount }));
    } catch {}
  };

  const handleApplyClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để ứng tuyển!');
      return;
    }
    if (user.role === 'employer') {
      alert('Tài khoản công ty không thể ứng tuyển!');
      return;
    }
    setShowApplyModal(true);
  };

  const handleFormChange = (e) => {
    if (e.target.name === 'cv') {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    const candidateToken = localStorage.getItem('candidate_token');
    if (!candidateToken) {
      setApplyMessage('Vui lòng đăng nhập với vai trò ứng viên.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('jobpost_id', id);

    try {
      await axios.post('http://localhost:3000/applications/add', data, {
        headers: {
          Authorization: `Bearer ${candidateToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setApplyMessage('Ứng tuyển thành công!');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMessage('');
      }, 2000);
    } catch (error) {
      setApplyMessage(`Lỗi ứng tuyển: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const res = await axios.get(`/employers/public/${job.employer_id}`);
      setCompanyInfo(res.data);
      setShowCompanyModal(true);
    } catch (err) {
      alert('Không thể tải thông tin công ty');
    }
  };

  if (error) return <p>{error}</p>;
  if (!job) return <p>Đang tải...</p>;

  return (
    <div className="job-detail-container">
      <div className="job-header">
        <div>
          <h2>{job.title}</h2>
          <p className="company-name">{job.company_name || 'Chưa có'}</p>
        </div>
        <div className="favorite-btn" onClick={toggleFavorite}>
          <i className={isFavorite ? 'bi bi-heart-fill text-danger' : 'bi bi-heart text-secondary'}></i>
          <span>{job.favorite_count || 0}</span>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <Button variant="info" onClick={fetchCompanyInfo}>Xem thông tin công ty</Button>
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

      <div className="">
        <h5>Thông tin công việc</h5>
        <p style={{ whiteSpace: 'pre-line' }}>{job.job_info || 'Chưa có thông tin'}</p>

        <h5>Yêu cầu công việc</h5>
        <p style={{ whiteSpace: 'pre-line' }}>{job.job_requirements || 'Chưa có yêu cầu'}</p>

        <h5>Quyền lợi</h5>
        <p style={{ whiteSpace: 'pre-line' }}>{job.benefits || 'Chưa có quyền lợi'}</p>
      </div>

      <div className="d-flex gap-2 mt-3">
        <Button variant="success" onClick={handleApplyClick}>Ứng tuyển</Button>
        <Button variant="secondary" onClick={() => navigate('/home')}>Quay lại</Button>
      </div>

      {/* Modal Ứng tuyển */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ứng tuyển công việc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applyMessage && (
            <Alert variant={applyMessage.includes('thành công') ? 'success' : 'danger'}>
              {applyMessage}
            </Alert>
          )}
          <Form onSubmit={submitApplication}>
            <Form.Group className="mb-3">
              <Form.Label>Tên ứng viên</Form.Label>
              <Form.Control
                type="text"
                name="candidate_name"
                value={formData.candidate_name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kỹ năng</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giới thiệu bản thân</Form.Label>
              <Form.Control
                as="textarea"
                name="introduction"
                value={formData.introduction}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tải CV lên (PDF)</Form.Label>
              <Form.Control
                type="file"
                name="cv"
                accept=".pdf"
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">Gửi ứng tuyển</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Thông tin công ty */}
      <Modal show={showCompanyModal} onHide={() => setShowCompanyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin công ty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {companyInfo ? (
            <>
              {companyInfo.avatar_url && (
                <img
                  src={companyInfo.avatar_url}
                  alt="Avatar"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '15px' }}
                />
              )}
              <p><strong>Tên công ty:</strong> {companyInfo.name}</p>
              <p><strong>Địa chỉ:</strong> {companyInfo.address}</p>
              <p><strong>Số điện thoại:</strong> {companyInfo.phone || 'Chưa có'}</p>
              <p><strong>Email:</strong> {companyInfo.email}</p>
              <p><strong>Website:</strong> <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">{companyInfo.website}</a></p>
              <p><strong>Giới thiệu:</strong> {companyInfo.company_intro}</p>
            </>
          ) : (
            <p>Đang tải...</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default JobDetail;
