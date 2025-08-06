import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ChangePassword = ({ show, onHide }) => {
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!show) {
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('');
    }
  }, [show]);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    const token = localStorage.getItem('employer_token');
    axios
      .put('/users/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setMessage('Đổi mật khẩu thành công!');
        setTimeout(() => {
          onHide();
        }, 1000); // Đóng modal sau 1 giây
      })
      .catch(error => {
        setMessage(error.response?.data?.message || 'Lỗi đổi mật khẩu!');
        console.error('Change password error:', error.response?.data || error.message);
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đổi mật khẩu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="danger">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu cũ</Form.Label>
            <Form.Control
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">Lưu thay đổi</Button>
          <Button variant="secondary" onClick={onHide} className="ms-2">Hủy</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePassword;