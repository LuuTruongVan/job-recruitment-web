import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const employerToken = localStorage.getItem('employer_token');
    const candidateToken = localStorage.getItem('candidate_token');
    const token = candidateToken || employerToken || adminToken;

    if (token) {
      axios.get('http://localhost:3001/users/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        const userData = response.data;
        setUser(userData);
        setProfileData(userData); // Dùng trực tiếp dữ liệu từ get-profile
      }).catch(error => {
        setError('Không thể tải thông tin hồ sơ.');
        console.error('Profile error:', error.response?.data || error.message);
      });
    }
  }, []);

  if (error) return <p>{error}</p>;
  if (!user || !profileData) return <p>Đang tải...</p>;

  return (
    <div className="container mt-4">
      <h2>Thông tin hồ sơ</h2>
      {user.role === 'candidate' && profileData && (
        <>
          <p><strong>Họ và tên:</strong> {profileData.full_name || 'Chưa có'}</p>
          <p><strong>Số điện thoại:</strong> {profileData.phone || 'Chưa có'}</p>
          <p><strong>Địa chỉ:</strong> {profileData.address || 'Chưa có'}</p>
          <p><strong>CV:</strong> {profileData.resume ? <a href={profileData.resume} target="_blank" rel="noopener noreferrer">Xem CV</a> : 'Chưa có'}</p>
          <p><strong>Kỹ năng:</strong> {profileData.skills || 'Chưa có'}</p>
        </>
      )}
 {user.role === 'employer' && profileData && (
  <>
    <p><strong>Tên công ty:</strong> {profileData.name || 'Chưa có'}</p>
    <p><strong>Địa chỉ:</strong> {profileData.address || 'Chưa có'}</p>
    <p><strong>Email:</strong> {profileData.email || 'Chưa có'}</p>
    <p><strong>Số điện thoại:</strong> {profileData.phone || 'Chưa có'}</p> {/* thêm phone */}
    <p><strong>Website:</strong> {profileData.website ? <a href={profileData.website} target="_blank" rel="noopener noreferrer">{profileData.website}</a> : 'Chưa có'}</p>
  </>
)}


      
      <Button variant="secondary" onClick={() => window.history.back()}>Quay lại</Button>
    </div>
  );
};

export default Profile;