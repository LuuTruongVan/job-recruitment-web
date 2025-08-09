import React, { useState, useEffect, useCallback } from 'react';
import { Carousel, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../componentCss/Home.css';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '', minSalary: '' });
  const [user, setUser] = useState(null);
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.minSalary) params.salary = `>= ${filters.minSalary}`;

      const response = await axios.get('/jobposts', { params });
      const jobsWithPositions = await Promise.all(response.data.map(async (job) => {
        if (job.job_position_id) {
          try {
            const positionResponse = await axios.get(`/jobposts/job-positions/${job.job_position_id}`);
            job.job_position = positionResponse.data.name || 'Chưa có vị trí';
          } catch (error) {
            console.error('Error fetching job position:', error);
            job.job_position = 'Chưa có vị trí';
          }
        } else {
          job.job_position = 'Chưa có vị trí';
        }
        return job;
      }));
      setJobs(jobsWithPositions);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
    const adminToken = localStorage.getItem('admin_token');
    const employerToken = localStorage.getItem('employer_token');
    const candidateToken = localStorage.getItem('candidate_token');
    let currentToken = candidateToken || employerToken || adminToken; // Ưu tiên candidate, sau đó employer, admin

    if (currentToken) {
      axios.get('http://localhost:3001/users/get-profile', {
        headers: { Authorization: `Bearer ${currentToken}` }
      }).then(response => {
        setUser(response.data);
        console.log('User data in Home:', response.data); // Debug
      }).catch(error => {
        console.error('Error fetching user in Home:', error.response?.data || error.message);
        setUser(null); // Đảm bảo set null nếu lỗi
      });
    }
    // Load danh sách yêu thích từ localStorage
    const savedFavorites = localStorage.getItem('favoriteJobs');
    if (savedFavorites) {
      setFavoriteJobs(JSON.parse(savedFavorites));
    }
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewDetail = (jobId) => {
    navigate(`/job-detail/${jobId}`);
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

  const toggleFavorite = (jobId) => {
    let updatedFavorites = [...favoriteJobs];
    if (favoriteJobs.includes(jobId)) {
      updatedFavorites = updatedFavorites.filter(id => id !== jobId);
    } else {
      updatedFavorites.push(jobId);
    }
    setFavoriteJobs(updatedFavorites);
    localStorage.setItem('favoriteJobs', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="home-container">
      {/* Slide */}
      <Carousel className="home-carousel">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/assets/img/slide1.jpg"
            alt="Slide 1"
          />
          <Carousel.Caption>
            <h3>Tin tức tuyển dụng nổi bật</h3>
            <p>Khám phá cơ hội mới ngay hôm nay!</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/assets/img/slide2.jpg"
            alt="Slide 2"
          />
          <Carousel.Caption>
            <h3>Cơ hội việc làm hấp dẫn</h3>
            <p>Ứng tuyển ngay để không bỏ lỡ!</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/assets/img/slide3.jpg"
            alt="Slide 3"
          />
          <Carousel.Caption>
            <h3>Khám phá sự nghiệp mới</h3>
            <p>Bắt đầu hành trình của bạn ngay bây giờ!</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Filters */}
      <div className="home-filters">
        <input
          type="text"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          placeholder="Lọc theo phân loại"
          className="me-2"
        />
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="Lọc theo địa điểm"
          className="me-2"
        />
        <input
          type="number"
          name="minSalary"
          value={filters.minSalary}
          onChange={handleFilterChange}
          placeholder="Lương tối thiểu (VND)"
          className="me-2"
        />
        <Button variant="primary" onClick={fetchJobs}>Lọc</Button>
      </div>

      {/* Job Listings */}
      <div className="home-job-listings row">
        {jobs.map(job => (
          <div className="col-md-4 mb-3" key={job.id}>
            <Card>
              <Card.Body>
                <Card.Title style={{ textAlign: 'center' }}>{job.title}</Card.Title>
                <Card.Text>
                  <strong>Vị trí công việc:</strong> {job.job_position}<br />
                  <strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}<br />
                  <strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}<br />
                  <strong>Địa chỉ:</strong> {job.location}<br />
                  <strong>Mức lương:</strong> {job.salary ? `${job.salary} VND` : 'Chưa có'}<br />
                  <strong>Ngày hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}
                </Card.Text>
                <div className="d-flex gap-2">
                  <Button variant="info" onClick={() => handleViewDetail(job.id)}>Xem chi tiết</Button>
                  <Button variant="success" onClick={() => handleApply(job.id)}>Ứng tuyển</Button>
                  <Button
                    variant={favoriteJobs.includes(job.id) ? 'warning' : 'outline-warning'}
                    onClick={() => toggleFavorite(job.id)}
                  >
                    {favoriteJobs.includes(job.id) ? 'Bỏ yêu thích' : 'Yêu thích'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;