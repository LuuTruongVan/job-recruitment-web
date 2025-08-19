import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../assets/css/UpdateProfile.css';

const UpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const employerToken = localStorage.getItem('employer_token');
    const candidateToken = localStorage.getItem('candidate_token');
    const token = candidateToken || employerToken || adminToken;

    if (token) {
      axios.get('http://localhost:3001/users/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setProfile(response.data);
        if (response.data.role === 'candidate') {
          setFormData({
            full_name: response.data.full_name || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            resume: response.data.resume || '',
            skills: response.data.skills || ''
          });
        } else if (response.data.role === 'employer') {
          setFormData({
            name: response.data.name || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            email: response.data.email || '',
            website: response.data.website || ''
          });
        }
      }).catch(error => {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setMessage('Lỗi tải thông tin cá nhân!');
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem('admin_token');
    const employerToken = localStorage.getItem('employer_token');
    const candidateToken = localStorage.getItem('candidate_token');
    const token = candidateToken || employerToken || adminToken;
  
    if (profile.role === 'employer' && !formData.email) {
      setMessage('Email không được để trống!');
      return;
    }
    try {
      await axios.put('http://localhost:3001/users/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Cập nhật thông tin thành công!');
  
      // ✅ Reload lại trang để header cập nhật
      setTimeout(() => {
        window.location.reload();
      }, 1000); // để user thấy thông báo thành công 1s rồi reload
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
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
      <Form.Label>Số điện thoại</Form.Label> {/* thêm input phone */}
      <Form.Control
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
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