// src/components/ProfileModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ProfileModal = ({ show, onHide }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token') ||
    '';

  // Fetch profile khi mở modal
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
              skills: res.data.skills || ''
            });
          } else if (res.data.role === 'employer') {
            setFormData({
              name: res.data.name || '',
              phone: res.data.phone || '',
              address: res.data.address || '',
              email: res.data.email || '',
              website: res.data.website || ''
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3001/users/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);
      // Reload profile sau khi update
      const res = await axios.get('http://localhost:3001/users/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Lỗi cập nhật thông tin!');
    }
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Body className="text-center">
          <Spinner animation="border" />
        </Modal.Body>
      </Modal>
    );
  }

  if (!profile) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Thông tin hồ sơ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>
            {message}
          </Alert>
        )}

        {!isEditing ? (
          <>
            {profile.role === 'candidate' && (
              <>
                <p><strong>Họ và tên:</strong> {profile.full_name || 'Chưa có'}</p>
                <p><strong>Số điện thoại:</strong> {profile.phone || 'Chưa có'}</p>
                <p><strong>Địa chỉ:</strong> {profile.address || 'Chưa có'}</p>
                <p><strong>Giới thiệu:</strong> {profile.resume ? <a href={profile.resume} target="_blank" rel="noopener noreferrer">Xem CV</a> : 'Chưa có'}</p>
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
                  <Form.Label>Giới thiệu</Form.Label>
                  <Form.Control type="text" name="resume" value={formData.resume} onChange={handleChange} />
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
              </>
            )}
            <Button variant="primary" type="submit">Lưu thay đổi</Button>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isEditing ? (
          <Button variant="warning" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Hủy</Button>
        )}
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileModal;
