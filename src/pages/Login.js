import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import logo from "../assets/img/logo.png";

const LoginModal = ({ show, onHide, onSwitch }) => {
  const [mode, setMode] = useState('login'); // login | forgot | verifyOtp | resetPassword
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [otpData, setOtpData] = useState({ email: '', otp: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    if (mode === 'login') {
      setCredentials({ ...credentials, [e.target.name]: e.target.value });
    } else {
      setOtpData({ ...otpData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3001/users/get', credentials);
      if (response.data.token) {
        const { token } = response.data;
        const decoded = jwt.decode(token);
        if (decoded.role !== 'admin' && decoded.is_verified === 0) {
          setMessage('Vui lòng xác thực email trước khi đăng nhập!');
          return;
        }
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3001/users/forgot-password', { email: otpData.email });
      setMessage(res.data.message);
      setMode('verifyOtp');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi gửi OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3001/users/verify-reset-otp', {
        email: otpData.email,
        otp: otpData.otp
      });
      setMessage(res.data.message);
      if (res.data.message.includes('thành công')) {
        setMode('resetPassword');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi xác minh OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3001/users/reset-password', {
        email: otpData.email,
        newPassword: otpData.newPassword
      });
      setMessage(res.data.message);
      if (res.data.message.includes('thành công')) {
        setMode('login');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi đặt lại mật khẩu');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="small-login-modal">
      <div style={{ textAlign: 'center', paddingTop: '15px' }}>
        <img src={logo} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
        <h5 style={{ fontWeight: 'bold', marginBottom: '10px' }}>
          {mode === 'login'
            ? 'Đăng Nhập'
            : mode === 'forgot'
            ? 'Quên mật khẩu'
            : mode === 'verifyOtp'
            ? 'Xác minh OTP'
            : 'Đặt lại mật khẩu'}
        </h5>
      </div>
      <Modal.Body>
        {message && (
          <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>
        )}

        {mode === 'login' && (
          <Form onSubmit={handleSubmitLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={credentials.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control type="password" name="password" value={credentials.password} onChange={handleChange} required />
            </Form.Group>
            <div className="text-end mb-3">
              <Button variant="link" style={{ padding: 0 }} onClick={() => setMode('forgot')}>
                Quên mật khẩu?
              </Button>
            </div>
            <Button variant="primary" type="submit" className="w-100">Đăng Nhập</Button>
          </Form>
        )}

        {mode === 'forgot' && (
          <Form onSubmit={handleSendOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={otpData.email} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Gửi mã OTP</Button>
          </Form>
        )}

        {mode === 'verifyOtp' && (
          <Form onSubmit={handleVerifyOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Mã OTP</Form.Label>
              <Form.Control type="text" name="otp" value={otpData.otp} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Xác minh OTP</Button>
          </Form>
        )}

        {mode === 'resetPassword' && (
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control type="password" name="newPassword" value={otpData.newPassword} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Đặt lại mật khẩu</Button>
          </Form>
        )}

        <div className="text-center mt-3">
          {mode !== 'login' ? (
            <Button variant="link" onClick={() => setMode('login')} style={{ padding: 0 }}>
              Quay lại đăng nhập
            </Button>
          ) : (
            <>
              <small>Chưa có tài khoản? </small>
              <Button variant="link" onClick={onSwitch} style={{ padding: 0 }}>
                Đăng ký ngay
              </Button>
            </>
          )}
        </div>
      </Modal.Body>
      <style>
        {`
          .small-login-modal .modal-dialog {
            max-width: 320px;
          }
        `}
      </style>
    </Modal>
  );
};

export default LoginModal;
