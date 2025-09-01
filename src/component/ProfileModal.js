import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Image, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ProfileModal = ({ show, onHide }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token') ||
    '';

  useEffect(() => {
    if (show && token) {
      setLoading(true);
      axios
        .get('http://localhost:3001/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setProfile(res.data);
          if (res.data.role === 'candidate') {
            setFormData({
              full_name: res.data.full_name || '',
              phone: res.data.phone || '',
              address: res.data.address || '',
              resume: res.data.resume || '',
              skills: res.data.skills || '',
              avatar_url: res.data.avatar_url || ''
            });
          } else if (res.data.role === 'employer') {
            setFormData({
              name: res.data.name || '',
              phone: res.data.phone || '',
              address: res.data.address || '',
              email: res.data.email || '',
              website: res.data.website || '',
              company_intro: res.data.company_intro || '',
              avatar_url: res.data.avatar_url || ''
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [show, token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:3001/upload-avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev) => ({ ...prev, avatar_url: res.data.url }));
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3001/users/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error(err);
      setMessage('Lỗi cập nhật thông tin!');
    }
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} centered dialogClassName="profile-modal">
        <Modal.Body className="text-center">
          <Spinner animation="border" />
        </Modal.Body>
      </Modal>
    );
  }

  if (!profile) return null;

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="profile-modal">
      <Modal.Header closeButton>
        <Modal.Title>Thông tin hồ sơ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>
            {message}
          </Alert>
        )}

        <Row>
          <Col md={8}>
            {!isEditing ? (
              <>
                {profile.role === 'candidate' && (
                  <>
                    <p><strong>Họ và tên:</strong> {profile.full_name || 'Chưa có'}</p>
                    <p><strong>Số điện thoại:</strong> {profile.phone || 'Chưa có'}</p>
                    <p><strong>Địa chỉ:</strong> {profile.address || 'Chưa có'}</p>
                    <p><strong>Kỹ năng:</strong> {profile.skills || 'Chưa có'}</p>
                  </>
                )}
                {profile.role === 'employer' && (
                  <>
                    <p><strong>Tên công ty:</strong> {profile.name || 'Chưa có'}</p>
                    <p><strong>Địa chỉ:</strong> {profile.address || 'Chưa có'}</p>
                    <p><strong>Email:</strong> {profile.email || 'Chưa có'}</p>
                    <p><strong>Số điện thoại:</strong> {profile.phone || 'Chưa có'}</p>
                    <p><strong>Website:</strong> {profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a> : 'Chưa có'}</p>
                    <p><strong>Giới thiệu công ty:</strong> {profile.company_intro || 'Chưa có'}</p>
                  </>
                )}
              </>
            ) : (
              <Form onSubmit={handleUpdate}>
                {profile.role === 'candidate' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Địa chỉ</Form.Label>
                      <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Kỹ năng</Form.Label>
                      <Form.Control type="text" name="skills" value={formData.skills} onChange={handleChange} />
                    </Form.Group>
                  </>
                )}
                {profile.role === 'employer' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên công ty</Form.Label>
                      <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Địa chỉ</Form.Label>
                      <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control type="text" name="website" value={formData.website} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Giới thiệu công ty</Form.Label>
                      <Form.Control as="textarea" rows={3} name="company_intro" value={formData.company_intro} onChange={handleChange} />
                    </Form.Group>
                  </>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>Chọn ảnh đại diện</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                  {uploading && <p>Đang tải ảnh...</p>}
                </Form.Group>
                <Button variant="primary" type="submit">Lưu thay đổi</Button>
              </Form>
            )}
          </Col>

          <Col md={4} className="text-center">
            {formData.avatar_url && (
              <Image
                src={formData.avatar_url}
                roundedCircle
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                alt="Avatar"
              />
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        {!isEditing ? (
          <Button variant="warning" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Hủy</Button>
        )}
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
      </Modal.Footer>

      <style>
        {`
          .profile-modal .modal-dialog {
            max-width: 600px;
          }
          .profile-modal .modal-content {
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal-backdrop {
            z-index: 1300; /* Cao hơn z-index của header (1200) */
          }
          .modal {
            z-index: 1400; /* Cao hơn backdrop để hiển thị modal lên trên */
          }
        `}
      </style>
    </Modal>
  );
};

export default ProfileModal;