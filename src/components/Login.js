import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../componentCss/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Giữ useNavigate

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      console.log('Sending login request to /users/get:', credentials);
      const response = await axios.post('/users/get', credentials);
      if (response.data.token) {
        localStorage.setItem('employer_token', response.data.token);
        setMessage('Đăng nhập thành công!');
        // Điều hướng và làm mới trang
        navigate('/');
        window.location.reload(); // Reset trang
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi đăng nhập!');
      console.error('Login error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Đăng Nhập</h2>
      {message && <Alert variant="danger">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Đăng Nhập</Button>
      </Form>
    </div>
  );
};

export default Login;