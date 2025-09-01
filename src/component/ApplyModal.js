import React from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const ApplyModal = ({
  show,
  onHide,
  formData,
  handleFormChange,
  submitApplication,
  applyMessage,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ứng tuyển công việc</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {applyMessage && (
          <Alert variant={applyMessage.includes("thành công") ? "success" : "danger"}>
            {applyMessage}
          </Alert>
        )}
        <Form onSubmit={submitApplication}>
          <Form.Group className="mb-3">
            <Form.Label>Tên ứng viên</Form.Label>
            <Form.Control
              type="text"
              name="candidate_name"
              value={formData.candidate_name}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Kỹ năng</Form.Label>
            <Form.Control
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Giới thiệu bản thân</Form.Label>
            <Form.Control
              as="textarea"
              name="introduction"
              value={formData.introduction}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tải CV lên (PDF)</Form.Label>
            <Form.Control
              type="file"
              name="cv"
              accept=".pdf"
              onChange={handleFormChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">Gửi ứng tuyển</Button>
        </Form>
      </Modal.Body>
      <style>
        {`
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

export default ApplyModal;