import React from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import logo from "../../assets/img/logo.png";
import { useAuth } from "../../hooks/useAuth";

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

        {mode === "login" && (
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
              <Button variant="link" style={{ padding: 0 }} onClick={() => setMode("forgot")}>
                Quên mật khẩu?
              </Button>
            </div>
            <Button variant="primary" type="submit" className="w-100">
              Đăng Nhập
            </Button>
          </Form>
        )}

        {mode === "forgot" && (
          <Form onSubmit={handleSendOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={otpData.email} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Gửi mã OTP
            </Button>
          </Form>
        )}

        {mode === "verifyOtp" && (
          <Form onSubmit={handleVerifyOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Mã OTP</Form.Label>
              <Form.Control type="text" name="otp" value={otpData.otp} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Xác minh OTP
            </Button>
          </Form>
        )}

        {mode === "resetPassword" && (
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control type="password" name="newPassword" value={otpData.newPassword} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
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
        `}
      </style>
    </Modal>
  );
};

export default LoginModal;
