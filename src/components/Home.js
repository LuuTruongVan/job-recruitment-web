import React, { useState, useEffect, useCallback } from 'react';
import { Carousel, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import '../componentCss/Home.css'; // Đã sửa đường dẫn

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '', minSalary: '' });

  const fetchJobs = useCallback(async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.minSalary) params.salary = `>= ${filters.minSalary}`;

      const response = await axios.get('/jobposts', { params });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
                <Card.Title>{job.title}</Card.Title>
                <Card.Text>
                  Mô tả: {job.description}<br />
                  Lương: {job.salary} VND<br />
                  Phân loại: {job.category}<br />
                  Địa điểm: {job.location}
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;