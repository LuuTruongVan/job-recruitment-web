import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import '../componentCss/ApplyJob.css';

const ApplyJob = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    candidate_name: '',
    phone: '',
    email: '',
    address: '',
    skills: '',
    introduction: '',
    cv: null
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'cv') {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const candidateToken = localStorage.getItem('candidate_token');
    const token = candidateToken;
    if (!token) {
      setMessage('Vui lòng đăng nhập với vai trò ứng viên.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('jobpost_id', id); // Sử dụng jobpost_id

    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post('http://localhost:3000/applications/add', data, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });
      console.log('Response from server:', response.data);
      setMessage('Ứng tuyển thành công!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error applying job:', error.response ? error.response.data : error.message);
      setMessage(`Lỗi ứng tuyển: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  return (
    <div className="apply-job-container">
      <h2>Ứng tuyển công việc</h2>
      {message && <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tên ứng viên</Form.Label>
          <Form.Control
            type="text"
            name="candidate_name"
            value={formData.candidate_name}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Địa chỉ</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Kỹ năng</Form.Label>
          <Form.Control
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Giới thiệu bản thân</Form.Label>
          <Form.Control
            as="textarea"
            name="introduction"
            value={formData.introduction}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tải CV lên (PDF)</Form.Label>
          <Form.Control
            type="file"
            name="cv"
            accept=".pdf"
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Gửi ứng tuyển</Button>
      </Form>
    </div>
  );
};

export default ApplyJob;