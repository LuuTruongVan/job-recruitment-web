import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const RegisterModal = ({ show, onHide, onSwitch }) => {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [message, setMessage] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3001/users/add', userData);
      if (response.status === 201) {
        setMessage('Đăng ký thành công! Vui lòng nhập mã OTP đã gửi tới email của bạn.');
        setShowOtpForm(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi đăng ký!');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('http://localhost:3001/users/verify-otp', {
        email: userData.email,
        otp
      });
      setMessage(res.data.message);
      if (res.data.message.includes('thành công')) {
        setTimeout(() => {
          setShowOtpForm(false);
          onSwitch();
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi xác thực OTP');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="small-register-modal">
      <div style={{ textAlign: 'center', paddingTop: '15px' }}>
        <img src="/assets/img/logo.png" alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
        <h5 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Đăng Ký</h5>
      </div>

      <Modal.Body>
        {message && (
          <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>
        )}

        {!showOtpForm ? (
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
              <Form.Label>Vai trò </Form.Label>
              <Form.Select name="role" value={userData.role} onChange={handleChange} required>
                <option value="candidate">Ứng viên tìm việc</option>
                <option value="employer">Nhà tuyển dụng</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Đăng Ký</Button>
          </Form>
        ) : (
          <div>
            <Form.Group>
              <Form.Label>Nhập mã OTP</Form.Label>
              <Form.Control
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP 6 số"
                required
              />
            </Form.Group>
            <Button onClick={handleVerifyOtp} className="mt-3 w-100" variant="success">
              Xác nhận OTP
            </Button>
          </div>
        )}

        {!showOtpForm && (
          <div className="text-center mt-3">
            <small>Đã có tài khoản? </small>
            <Button variant="link" onClick={onSwitch} style={{ padding: 0 }}>Đăng nhập ngay</Button>
          </div>
        )}
      </Modal.Body>

      <style>
        {`
          .small-register-modal .modal-dialog {
            max-width: 320px;
          }
        `}
      </style>
    </Modal>
  );
};

export default RegisterModal;
