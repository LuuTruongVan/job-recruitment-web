import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import '../componentCss/PostJob.css';

const PostJob = () => {
  const [job, setJob] = useState({ title: '', description: '', salary: '', category: '', location: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('employer_token');
    console.log('Sending job data:', job); // Log dữ liệu gửi lên
    try {
      await axios.post('/jobposts', job, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Đăng tin thành công!');
      setJob({ title: '', description: '', salary: '', category: '', location: '' }); // Reset form
    } catch (error) {
      setMessage('Lỗi khi đăng tin: ' + error.response?.data?.message || error.message);
      console.error('Post job error:', error.response?.data || error.message); // Log lỗi chi tiết
    }
  };

  return (
    <div className="post-job">
      <h2>Đăng tin tuyển dụng</h2>
      {message && <p>{message}</p>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tiêu đề</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={job.title}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={job.description}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Lương (VND)</Form.Label>
          <Form.Control
            type="number"
            name="salary"
            value={job.salary}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Phân loại</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={job.category}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Địa điểm</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={job.location}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Đăng tin</Button>
      </Form>
    </div>
  );
};

export default PostJob;