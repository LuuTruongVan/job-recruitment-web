import jwt from 'jsonwebtoken';
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../componentCss/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      console.log('Sending login request to /users/get:', credentials);
      const response = await axios.post('http://localhost:3001/users/get', credentials); // Đảm bảo port 3001
      if (response.data.token) {
        const { token } = response.data;
        const decoded = jwt.decode(token);
        console.log('Decoded token:', decoded); // Debug role
        const tokenKey = decoded.role === 'admin' ? 'admin_token' : decoded.role === 'employer' ? 'employer_token' : 'candidate_token';
        localStorage.setItem(tokenKey, token);
        setMessage('Đăng nhập thành công!');
        navigate('/');
        window.location.reload();
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