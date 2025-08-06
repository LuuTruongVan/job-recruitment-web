import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import axios from 'axios';

const Favorites = () => {
  const [favoriteJobDetails, setFavoriteJobDetails] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('employer_token');

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteJobs = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
      const details = await Promise.all(favoriteJobs.map(async (jobId) => {
        try {
          const response = await axios.get(`/jobposts/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching job details:', error);
          return null;
        }
      }));
      setFavoriteJobDetails(details.filter(job => job !== null));
    };
    if (token) loadFavorites();
  }, [token]);

  const toggleFavorite = (jobId) => {
    let updatedFavorites = JSON.parse(localStorage.getItem('favoriteJobs') || '[]').filter(id => id !== jobId);
    setFavoriteJobDetails(favoriteJobDetails.filter(job => job.id !== jobId));
    localStorage.setItem('favoriteJobs', JSON.stringify(updatedFavorites));
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
              <Card>
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
                    <Button
                      variant="warning"
                      className="ms-2"
                      onClick={() => toggleFavorite(job.id)}
                    >
                      Bỏ yêu thích
                    </Button>
                  </div>
                </Card.Body> {/* Đóng thẻ Card.Body ở đây */}
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