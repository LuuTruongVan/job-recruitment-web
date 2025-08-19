import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/Favorites.css';

const Favorites = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
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
  const token = localStorage.getItem('candidate_token') ||
                localStorage.getItem('employer_token') ||
                localStorage.getItem('admin_token') || '';

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const jobsData = res.data;

      const jobsWithPositions = await Promise.all(
        jobsData.map(async (job) => {
          if (job.job_position_id) {
            try {
              const positionResponse = await axios.get(
                `/jobposts/job-positions/${job.job_position_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              job.job_position = positionResponse.data.name || 'Chưa có vị trí';
            } catch {
              job.job_position = 'Chưa có vị trí';
            }
          } else {
            job.job_position = 'Chưa có vị trí';
          }
          return job;
        })
      );

      setJobs(jobsWithPositions);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.get('/users/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => setUser(response.data))
        .catch(() => setUser(null));

      fetchFavorites();
    }
  }, [fetchFavorites, token]);

  const toggleFavorite = async (jobId) => {
    try {
      await axios.delete(`/favorites/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleApplyClick = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'employer') {
      alert('Tài khoản công ty không thể ứng tuyển!');
      return;
    }
    setSelectedJob(job);
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
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append('jobpost_id', selectedJob.id);

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

  return (
    <div className="favorites-container container my-4">
      <h3 className="mb-4">Danh sách yêu thích</h3>
      {jobs.length === 0 ? (
        <p>Chưa có công việc yêu thích nào.</p>
      ) : (
        <div className="row">
          {jobs.map((job) => (
            <div className="col-md-4 mb-4" key={job.id}>
              <Card className="h-100 shadow-sm position-relative">
                <div
                  className="favorite-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(job.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    cursor: 'pointer',
                    color: 'red',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    zIndex: 10,
                  }}
                  title="Bỏ yêu thích"
                >
                  <i className="bi bi-heart-fill"></i>
                </div>

                <Card.Body
                  onClick={() => navigate(`/job-detail/${job.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <Card.Title className="text-center">{job.title}</Card.Title>
                  <Card.Text className="job-description">
                    <strong>Vị trí công việc:</strong> {job.job_position}
                    <br />
                    <strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}
  <br />
                    <strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}
                    <br />
                    <strong>Địa chỉ:</strong> {job.location}
                    <br />
                    <strong>Mức lương:</strong>{' '}
{job.salary
  ? `${parseInt(job.salary, 10).toLocaleString('vi-VN')} VND`
  : 'Chưa có'}


                    <br />
                    <strong>Ngày hết hạn:</strong>{' '}
                    {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}
                  </Card.Text>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-between">
                  <Button variant="info" onClick={() => navigate(`/job-detail/${job.id}`)}>Xem chi tiết</Button>
                  <Button variant="success" onClick={() => handleApplyClick(job)}>Ứng tuyển</Button>
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>
      )}

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

export default Favorites;
