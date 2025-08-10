import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import axios from 'axios';

const Favorites = () => {
  const [favoriteJobDetails, setFavoriteJobDetails] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token');

  const fetchFavoriteCount = async (jobId) => {
    try {
      const res = await axios.get(`/favorites/count/${jobId}`);
      return res.data.count || 0;
    } catch {
      return 0;
    }
  };

  const loadFavorites = useCallback(async () => {
    try {
      const response = await axios.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Lấy count cho từng job
      const jobsWithCount = await Promise.all(
        response.data.map(async (job) => ({
          ...job,
          favorite_count: await fetchFavoriteCount(job.id)
        }))
      );
      setFavoriteJobDetails(jobsWithCount);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get('/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (token) {
      loadUser();
      loadFavorites();
    }
  }, [token, loadFavorites]);

  const toggleFavorite = async (jobId) => {
    try {
      await axios.delete(`/favorites/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Reload lại danh sách để đồng bộ count
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleApply = (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'employer') {
      alert('Tài khoản công ty không thể ứng tuyển!');
      return;
    }
    navigate(`/apply-job/${jobId}`);
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách yêu thích</h2>
      {favoriteJobDetails.length === 0 ? (
        <p>Không có công việc nào trong danh sách yêu thích.</p>
      ) : (
        <div className="row">
          {favoriteJobDetails.map(job => (
            <div className="col-md-4 mb-3" key={job.id}>
              <Card className="position-relative">
                <div
                  onClick={() => toggleFavorite(job.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
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
                  <i className="bi bi-heart-fill text-danger"></i>
                  <span>{job.favorite_count || 0}</span>
                </div>

                <Card.Body>
                  <Card.Title style={{ textAlign: 'center' }}>{job.title}</Card.Title>
                  <Card.Text>
                    <strong>Vị trí công việc:</strong> {job.job_position || 'Chưa có vị trí'}<br />
                    <strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}<br />
                    <strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}<br />
                    <strong>Địa chỉ:</strong> {job.location}<br />
                    <strong>Mức lương:</strong> {job.salary ? `${job.salary} VND` : 'Chưa có'}<br />
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button variant="info" onClick={() => navigate(`/job-detail/${job.id}`)}>Xem chi tiết</Button>
                    <Button variant="success" onClick={() => handleApply(job.id)}>Ứng tuyển</Button>
             
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
      <Button variant="secondary" onClick={() => navigate('/home')} className="mt-3">Quay lại</Button>
    </div>
  );
};

export default Favorites;
