import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const PostJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    salary: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Lấy token từ localStorage (giả định đã lưu trước)
  const token = localStorage.getItem('employer_token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    if (!token) {
      setMessage('Vui lòng đăng nhập để đăng tin!');
      return;
    }

    try {
      const response = await axios.post('/jobposts/add', jobData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        setSuccess(true);
        setMessage('Đăng tin thành công!');
        // Reset form
        setJobData({ title: '', description: '', category: '', location: '', salary: '' });
      }
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || 'Lỗi khi đăng tin!');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Đăng Tin Tuyển Dụng</h2>
      {message && (
        <Alert variant={success ? 'success' : 'danger'} className="mb-4">
          {message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formTitle">
          <Form.Label>Tiêu đề</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={jobData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={jobData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formCategory">
          <Form.Label>Danh mục</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={jobData.category}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formLocation">
          <Form.Label>Địa điểm</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={jobData.location}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formSalary">
          <Form.Label>Lương (USD)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="salary"
            value={jobData.salary}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Đăng Tin
        </Button>
      </Form>
    </div>
  );
};

export default PostJob;