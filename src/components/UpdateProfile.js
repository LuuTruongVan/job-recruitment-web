import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../componentCss/UpdateProfile.css';

const UpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('employer_token');
    if (token) {
      axios.get('/users/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setProfile(response.data);
        if (response.data.role === 'candidate') {
          setFormData({
            full_name: '',
            phone: '',
            address: '',
            resume: '',
            skills: ''
          });
        } else if (response.data.role === 'employer') {
          setFormData({
            name: '',
            address: '',
            email: '',
            website: ''
          });
        }
      }).catch(error => {
        console.error('Error fetching profile:', error);
        setMessage('Lỗi tải thông tin cá nhân!');
      });
    }
  }, []);

  useEffect(() => {
    if (profile) {
      const token = localStorage.getItem('employer_token');
      if (profile.role === 'candidate') {
        axios.get(`/candidates/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          setFormData({
            full_name: response.data.full_name || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            resume: response.data.resume || '',
            skills: response.data.skills || ''
          });
        }).catch(error => {
          console.error('Error fetching candidate details:', error);
          // Nếu 404, có thể profile chưa được tạo, để formData rỗng
          if (error.response?.status === 404) {
            setFormData({
              full_name: '',
              phone: '',
              address: '',
              resume: '',
              skills: ''
            });
          }
        });
      } else if (profile.role === 'employer') {
        axios.get(`/employers/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          setFormData({
            name: response.data.name || '',
            address: response.data.address || '',
            email: response.data.email || '',
            website: response.data.website || ''
          });
        }).catch(error => {
          console.error('Error fetching employer details:', error);
        });
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('employer_token');
    if (profile.role === 'employer' && !formData.email) {
      setMessage('Email không được để trống!');
      return;
    }
    try {
      await axios.put('/users/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Lỗi cập nhật thông tin!');
    }
  };

  if (!profile) return <p>Đang tải...</p>;

  return (
    <div className="update-profile-container">
      <h2>Cập nhật thông tin</h2>
      {message && <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        {profile.role === 'candidate' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Resume (URL)</Form.Label>
              <Form.Control
                type="text"
                name="resume"
                value={formData.resume}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kỹ năng</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}
        {profile.role === 'employer' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Tên công ty</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}
        <Button variant="primary" type="submit">Lưu thay đổi</Button>
      </Form>
    </div>
  );
};

export default UpdateProfile;