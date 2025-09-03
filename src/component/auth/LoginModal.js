import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import logo from "../../assets/img/logo.png";
import { useAuth } from "../../hooks/useAuth";
import "../../assets/css/Login.css";

const LoginModal = ({ show, onHide, onSwitch }) => {
  const {
    mode,
    setMode,
    credentials,
    otpData,
    message,
    handleChange,
    handleSubmitLogin,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
  } = useAuth(() => {
    onHide();
    window.location.reload();
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="small-login-modal">
      <div style={{ textAlign: "center", paddingTop: "15px" }}>
        <img src={logo} alt="Logo" style={{ maxHeight: "60px", marginBottom: "10px" }} />
        <h5 style={{ fontWeight: "bold", marginBottom: "10px" }}>
          {mode === "login"
            ? "Đăng Nhập"
            : mode === "forgot"
            ? "Quên mật khẩu"
            : mode === "verifyOtp"
            ? "Xác minh OTP"
            : "Đặt lại mật khẩu"}
        </h5>
      </div>
      <Modal.Body>
        {message && (
          <Alert variant={message.includes("thành công") ? "success" : "danger"}>{message}</Alert>
        )}

        {/* Đăng nhập */}
        {mode === "login" && (
          <Form onSubmit={handleSubmitLogin} className="login-container">
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

            {/* Mật khẩu */}
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <div className="password-container">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="form-control password-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>
            </Form.Group>

            <div className="text-end mb-3">
              <Button variant="link" style={{ padding: 0 }} onClick={() => setMode("forgot")}>
                Quên mật khẩu?
              </Button>
            </div>
            <Button variant="primary" type="submit" className="w-100 btn-primary">
              Đăng Nhập
            </Button>
          </Form>
        )}

        {/* Quên mật khẩu */}
        {mode === "forgot" && (
          <Form onSubmit={handleSendOtp} className="login-container">
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={otpData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 btn-primary">
              Gửi mã OTP
            </Button>
          </Form>
        )}

        {/* Xác minh OTP */}
        {mode === "verifyOtp" && (
          <Form onSubmit={handleVerifyOtp} className="login-container">
            <Form.Group className="mb-3">
              <Form.Label>Mã OTP</Form.Label>
              <Form.Control
                type="text"
                name="otp"
                value={otpData.otp}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 btn-primary">
              Xác minh OTP
            </Button>
          </Form>
        )}

        {/* Đặt lại mật khẩu */}
        {mode === "resetPassword" && (
          <Form onSubmit={handleResetPassword} className="login-container">
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <div className="password-container">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={otpData.newPassword}
                  onChange={handleChange}
                  required
                  className="form-control password-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 btn-primary">
              Đặt lại mật khẩu
            </Button>
          </Form>
        )}

        <div className="text-center mt-3">
          {mode !== "login" ? (
            <Button variant="link" onClick={() => setMode("login")} style={{ padding: 0 }}>
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
          .modal-backdrop {
            z-index: 1300;
          }
          .modal {
            z-index: 1400;
          }
        `}
      </style>
    </Modal>
  );
};

export default LoginModal;
