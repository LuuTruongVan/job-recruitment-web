import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const LoginModal = ({ show, onHide, onSwitch }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3001/users/get', credentials);
      if (response.data.token) {
        const { token } = response.data;
        const decoded = jwt.decode(token);
        const tokenKey =
          decoded.role === 'admin'
            ? 'admin_token'
            : decoded.role === 'employer'
            ? 'employer_token'
            : 'candidate_token';
        localStorage.setItem(tokenKey, token);
        setMessage('Đăng nhập thành công!');
        onHide();
        window.location.reload();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi đăng nhập!');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đăng Nhập</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={credentials.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control type="password" name="password" value={credentials.password} onChange={handleChange} required />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">Đăng Nhập</Button>
        </Form>
        <div className="text-center mt-3">
          <small>Chưa có tài khoản? </small>
          <Button variant="link" onClick={onSwitch} style={{ padding: 0 }}>Đăng ký ngay</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
