import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import logo from "../../assets/img/logo.png";
import { useRegister } from "../../hooks/useRegister";
import "../../assets/css/Register.css";

const RegisterModal = ({ show, onHide, onSwitch }) => {
  const {
    userData,
    message,
    showOtpForm,
    otp,
    setOtp,
    handleChange,
    handleSubmit,
    handleVerifyOtp,
    handleBack,
  } = useRegister(onSwitch);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="small-register-modal">
      <div style={{ textAlign: "center", paddingTop: "15px" }}>
        <img src={logo} alt="Logo" style={{ maxHeight: "60px", marginBottom: "10px" }} />
        <h5 style={{ fontWeight: "bold", marginBottom: "10px" }}>Đăng Ký</h5>
      </div>

      <Modal.Body>
        {message && (
          <Alert variant={message.includes("thành công") ? "success" : "danger"}>{message}</Alert>
        )}

        {!showOtpForm ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <div className="password-container">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userData.password}
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

            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select name="role" value={userData.role} onChange={handleChange} required>
                <option value="candidate">Ứng viên tìm việc</option>
                <option value="employer">Nhà tuyển dụng</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Đăng Ký
            </Button>
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
            <Button onClick={handleVerifyOtp} className="mt-3 w-100" variant="primary">
              Xác nhận OTP
            </Button>
            <Button
              onClick={handleBack}
              className="mt-2 w-100"
              variant="outline-secondary"
            >
              Quay lại
            </Button>
          </div>
        )}

        {!showOtpForm && (
          <div className="text-center mt-3">
            <small>Đã có tài khoản? </small>
            <Button variant="link" onClick={onSwitch} style={{ padding: 0 }}>
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </Modal.Body>

      <style>
        {`
          .small-register-modal .modal-dialog {
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

export default RegisterModal;