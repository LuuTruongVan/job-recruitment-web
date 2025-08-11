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

  const navigate = useNavigate();
  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token');

  // Lấy số lượng yêu thích
  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await axios.get(`/favorites/count/${id}`);
      return res.data.count || 0;
    } catch (err) {
      console.error('Error fetching favorite count:', err);
      return 0;
    }
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobResponse = await axios.get(`/jobposts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const jobData = jobResponse.data;
        jobData.favorite_count = await fetchFavoriteCount();

        if (jobData.job_position_id) {
          try {
            const positionResponse = await axios.get(
              `/jobposts/job-positions/${jobData.job_position_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
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
      try {
        const userResponse = await axios.get('/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        const favRes = await axios.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(favRes.data.some(fav => fav.id === parseInt(id)));
      } catch (err) {
        console.error('Error fetching user or favorites:', err);
      }
    };

    if (token) {
      fetchJob();
      fetchUser();
    }
  }, [id, token, fetchFavoriteCount]);

  const toggleFavorite = async () => {
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
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
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
      console.error('Error applying job:', error.response ? error.response.data : error.message);
      setApplyMessage(`Lỗi ứng tuyển: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  if (error) return <p>{error}</p>;
  if (!job) return <p>Đang tải...</p>;

  return (
    <div className="job-detail-container">
      <div className="d-flex justify-content-between align-items-center">
        <h2>{job.title}</h2>
        <div
          onClick={toggleFavorite}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255,255,255,0.8)',
            padding: '3px 6px',
            borderRadius: '12px',
            fontSize: '14px'
          }}
        >
          <i className={isFavorite ? 'bi bi-heart-fill text-danger' : 'bi bi-heart text-secondary'}></i>
          <span>{job.favorite_count || 0}</span>
        </div>
      </div>

      <p><strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}</p>
      <p><strong>Vị trí công việc:</strong> {job.job_position}</p>
      <p><strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}</p>
      <p><strong>Thông tin công việc:</strong> {job.job_info || 'Chưa có thông tin'}</p>
      <p><strong>Yêu cầu công việc:</strong> {job.job_requirements || 'Chưa có yêu cầu'}</p>
      <p><strong>Quyền lợi:</strong> {job.benefits || 'Chưa có quyền lợi'}</p>
      <p><strong>Lương:</strong> {job.salary} VND</p>
      <p><strong>Phân loại:</strong> {job.category}</p>
      <p><strong>Địa chỉ:</strong> {job.location}</p>
      <p><strong>Email liên hệ:</strong> {job.email_contact || 'Chưa có email'}</p>
      <p><strong>Ngày đăng:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
      <p><strong>Ngày hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</p>

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
    </div>
  );
};

export default JobDetail;
