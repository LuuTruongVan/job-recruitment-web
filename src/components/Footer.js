import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../componentCss/Footer.css"; // Tự tạo file CSS nếu muốn style riêng

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-light pt-4 border-top">
      <Container>
        <Row className="mb-4">
          {/* Logo và thông tin công ty */}
          <Col md={4} className="mb-3">
            <h5 className="fw-bold text-warning">Fidovn</h5>
            <p>CÔNG TY TNHH FIDOVN</p>
            <p>Số GCN đăng ký: 0318555010</p>
            <p>Đại diện pháp luật: Bà Lưu Thúy My</p>
            <p>Chức danh: Giám đốc</p>
            <p className="fw-bold">Tải ứng dụng tại đây</p>
            <div className="d-flex gap-2">
              <img src="/appstore.png" alt="App Store" height="40" />
              <img src="/googleplay.png" alt="Google Play" height="40" />
            </div>
          </Col>

          {/* Thông tin liên hệ */}
          <Col md={4} className="mb-3">
            <h6 className="fw-bold">Thông tin liên hệ</h6>
            <p>Địa chỉ: 19-21 Tân Cảng, P.25, Q.Bình Thạnh, TP.HCM</p>
            <p>Email: info@fidovn.com</p>
            <p>Số điện thoại: <span className="text-danger fw-bold">028 62873344</span></p>
          </Col>

          {/* Mục lục & MXH */}
          <Col md={4} className="mb-3">
            <h6 className="fw-bold">Mục lục</h6>
            <p>Trang chủ</p>
            <p>Việc làm</p>
            <p>Bất động sản</p>
            <p>Hướng dẫn sử dụng</p>
            <h6 className="fw-bold mt-3">Theo dõi chúng tôi tại</h6>
            <div className="d-flex gap-3 fs-4">
              <i className="bi bi-facebook"></i>
              <i className="bi bi-tiktok"></i>
              <i className="bi bi-youtube"></i>
            </div>
          </Col>
        </Row>

        {/* Nút scroll top */}
        <Button
          variant="warning"
          onClick={scrollToTop}
          className="position-fixed bottom-0 end-0 m-3 rounded-circle"
          style={{ width: "50px", height: "50px" }}
        >
          <i className="bi bi-arrow-up"></i>
        </Button>

        {/* Bản quyền */}
        <div className="text-center py-3 border-top mt-3">
          <small>Thiết kế bởi CÔNG TY TNHH FIDOVN</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
