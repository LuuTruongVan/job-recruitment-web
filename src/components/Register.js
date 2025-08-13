import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const RegisterModal = ({ show, onHide, onSwitch }) => {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3001/users/add', userData);
      if (response.status === 201) {
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setUserData({ name: '', email: '', password: '', role: 'candidate' });

        // Tự động chuyển sang modal đăng nhập sau 2 giây
        setTimeout(() => {
          onSwitch();
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi đăng ký!');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đăng Ký</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên</Form.Label>
            <Form.Control type="text" name="name" value={userData.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={userData.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control type="password" name="password" value={userData.password} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select name="role" value={userData.role} onChange={handleChange} required>
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">Đăng Ký</Button>
        </Form>
        <div className="text-center mt-3">
          <small>Đã có tài khoản? </small>
          <Button variant="link" onClick={onSwitch} style={{ padding: 0 }}>Đăng nhập ngay</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;
