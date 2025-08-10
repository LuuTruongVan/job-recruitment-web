import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import '../componentCss/JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token');

  // Dùng useCallback để tránh warning missing dependency
  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await axios.get(`/favorites/count/${id}`);
      return res.data.count || 0;
    } catch (err) {
      console.error('Error fetching favorite count:', err);
      return 0;
    }
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobResponse = await axios.get(`/jobposts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const jobData = jobResponse.data;
        jobData.favorite_count = await fetchFavoriteCount();

        if (jobData.job_position_id) {
          try {
            const positionResponse = await axios.get(
              `/jobposts/job-positions/${jobData.job_position_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            jobData.job_position = positionResponse.data.name || 'Chưa có vị trí';
          } catch {
            jobData.job_position = 'Chưa có vị trí';
          }
        } else {
          jobData.job_position = 'Chưa có vị trí';
        }
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job detail:', err);
        setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      }
    };

    const fetchUser = async () => {
      try {
        const userResponse = await axios.get('/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        const favRes = await axios.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(favRes.data.some(fav => fav.id === parseInt(id)));
      } catch (err) {
        console.error('Error fetching user or favorites:', err);
      }
    };

    if (token) {
      fetchJob();
      fetchUser();
    }
  }, [id, token, fetchFavoriteCount]);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'employer') {
      alert('Tài khoản công ty không thể ứng tuyển!');
      return;
    }
    navigate(`/apply-job/${id}`);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(`/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
      } else {
        await axios.post(
          '/favorites',
          { jobpost_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      }

      // Load lại số lượng từ API để đồng bộ
      const updatedCount = await fetchFavoriteCount();
      setJob(prev => ({ ...prev, favorite_count: updatedCount }));
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  if (error) return <p>{error}</p>;
  if (!job) return <p>Đang tải...</p>;

  return (
    <div className="job-detail-container">
      <div className="d-flex justify-content-between align-items-center">
        <h2>{job.title}</h2>
        {/* Icon trái tim + số lượng */}
        <div
          onClick={toggleFavorite}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255,255,255,0.8)',
            padding: '3px 6px',
            borderRadius: '12px',
            fontSize: '14px'
          }}
        >
          <i className={isFavorite ? 'bi bi-heart-fill text-danger' : 'bi bi-heart text-secondary'}></i>
          <span>{job.favorite_count || 0}</span>
        </div>
      </div>

      <p><strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}</p>
      <p><strong>Vị trí công việc:</strong> {job.job_position}</p>
      <p><strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}</p>
      <p><strong>Thông tin công việc:</strong> {job.job_info || 'Chưa có thông tin'}</p>
      <p><strong>Yêu cầu công việc:</strong> {job.job_requirements || 'Chưa có yêu cầu'}</p>
      <p><strong>Quyền lợi:</strong> {job.benefits || 'Chưa có quyền lợi'}</p>
      <p><strong>Lương:</strong> {job.salary} VND</p>
      <p><strong>Phân loại:</strong> {job.category}</p>
      <p><strong>Địa chỉ:</strong> {job.location}</p>
      <p><strong>Email liên hệ:</strong> {job.email_contact || 'Chưa có email'}</p>
      <p><strong>Ngày đăng:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
      <p><strong>Ngày hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</p>

      <div className="d-flex gap-2 mt-3">
        <Button variant="success" onClick={handleApply}>Ứng tuyển</Button>
        <Button variant="secondary" onClick={() => navigate('/home')}>Quay lại</Button>
      </div>
    </div>
  );
};

export default JobDetail;
