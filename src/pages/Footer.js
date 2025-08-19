import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import '../assets/css/Footer.css';

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
            <h5 className="fw-bold text-warning">SUPVIEC</h5>
            <p>CÔNG TY TNHH SUPVIEC</p>
            <p>Số GCN đăng ký: 0931167255</p>
            <p>Đại diện pháp luật: Lưu Trường Văn</p>
            <p>Chức danh: Giám đốc</p>
            
          </Col>

          {/* Thông tin liên hệ */}
          <Col md={4} className="mb-3">
            <h6 className="fw-bold">Thông tin liên hệ</h6>
            <p>Địa chỉ: Trường Đại Học Giao Thông Vận Tải TPHCM</p>
            <p>Email: luutruongvan1607@gmail.com</p>
            <p>
              Số điện thoại:{" "}
              <span className="text-danger fw-bold">0931167255</span>
            </p>
          </Col>

          {/* Mục lục & MXH */}
          <Col md={4} className="mb-3">
            <h6 className="fw-bold">Mục lục</h6>
            <p>Trang chủ</p>
            <h6 className="fw-bold mt-3">Theo dõi chúng tôi tại</h6>
            <div className="d-flex gap-3 fs-4">
              <i className="bi bi-facebook"></i>
              <i className="bi bi-tiktok"></i>
              <i className="bi bi-youtube"></i>
            </div>
            <p className="fw-bold">Tải ứng dụng tại đây</p>
            <div className="d-flex gap-2">
              <img src="/assets/img/qr-appstore.jpg" alt="App Store" height="65" width="65" />
              <img src="/assets/img/qr-ggplay.jpg" alt="Google Play" height="65" width="65" />
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
          <small>Thiết kế bởi CÔNG TY TNHH SUPVIEC</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
