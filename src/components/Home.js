import React, { useState, useEffect, useCallback } from 'react';
import { Carousel, Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import '../componentCss/Home.css';

const provinces = [
  "Hà Nội","Hồ Chí Minh","Hải Phòng","Đà Nẵng","Cần Thơ","An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu",
  "Bắc Ninh","Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận","Cà Mau","Cao Bằng","Đắk Lắk","Đắk Nông",
  "Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Tĩnh","Hải Dương","Hậu Giang","Hòa Bình",
  "Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định",
  "Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị",
  "Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang","Trà Vinh",
  "Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái","Phú Yên"
];

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '', minSalary: '', favoriteSort: '' });
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token') ||
    '';

  // Lấy danh mục từ backend
  useEffect(() => {
    axios.get('/categories')
      .then(res => {
        setCategories(res.data.map(cat => ({ value: cat.name, label: cat.name })));
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.minSalary) params.salary = filters.minSalary;

      const response = await axios.get('/jobposts', { params });
      let jobsData = response.data;

      // Sắp xếp theo favorite
      if (filters.favoriteSort === 'desc') {
        jobsData.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
      } else if (filters.favoriteSort === 'asc') {
        jobsData.sort((a, b) => (a.favorite_count || 0) - (b.favorite_count || 0));
      }

      // Lấy tên vị trí công việc
      const jobsWithPositions = await Promise.all(
        jobsData.map(async (job) => {
          if (job.job_position_id) {
            try {
              const positionResponse = await axios.get(`/jobposts/job-positions/${job.job_position_id}`);
              job.job_position = positionResponse.data.name || 'Chưa có vị trí';
            } catch {
              job.job_position = 'Chưa có vị trí';
            }
          } else {
            job.job_position = 'Chưa có vị trí';
          }
          return job;
        })
      );

      setJobs(jobsWithPositions);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, [filters]);

  // Lấy favorites của user
  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.map((job) => job.id));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
    if (token) {
      axios.get('/users/get-profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => setUser(null));

      fetchFavorites();
    }
  }, [fetchJobs, fetchFavorites, token]);

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleViewDetail = (jobId) => navigate(`/job-detail/${jobId}`);

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

  const toggleFavorite = async (jobId) => {
    try {
      if (favorites.includes(jobId)) {
        await axios.delete(`/favorites/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter((id) => id !== jobId));
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === jobId ? { ...j, favorite_count: j.favorite_count - 1 } : j
          )
        );
      } else {
        await axios.post(
          '/favorites',
          { jobpost_id: jobId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, jobId]);
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === jobId ? { ...j, favorite_count: j.favorite_count + 1 } : j
          )
        );
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <div className="home-container">
      {/* Slide Banner */}
      <Carousel className="home-carousel mb-4">
        <Carousel.Item>
          <img className="d-block w-100" src="/assets/img/slide1.jpg" alt="Slide 1" />
          <Carousel.Caption>
            <h3>Tin tức tuyển dụng nổi bật</h3>
            <p>Khám phá cơ hội mới ngay hôm nay!</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src="/assets/img/slide2.jpg" alt="Slide 2" />
          <Carousel.Caption>
            <h3>Cơ hội việc làm hấp dẫn</h3>
            <p>Ứng tuyển ngay để không bỏ lỡ!</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src="/assets/img/slide3.jpg" alt="Slide 3" />
          <Carousel.Caption>
            <h3>Khám phá sự nghiệp mới</h3>
            <p>Bắt đầu hành trình của bạn ngay bây giờ!</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Bộ lọc */}
      <div className="home-filters d-flex gap-2 mb-3">
        <Select
          options={categories}
          placeholder="Chọn phân loại"
          isClearable
          onChange={(opt) => handleFilterChange('category', opt ? opt.value : '')}
        />
        <Select
          options={provinces.map(p => ({ value: p, label: p }))}
          placeholder="Chọn địa điểm"
          isClearable
          onChange={(opt) => handleFilterChange('location', opt ? opt.value : '')}
        />
        <Form.Control
          type="number"
          placeholder="Lương tối thiểu (VND)"
          onChange={(e) => handleFilterChange('minSalary', e.target.value)}
        />
        <Select
          options={[
            { value: 'desc', label: 'Yêu thích nhiều → ít' },
            { value: 'asc', label: 'Yêu thích ít → nhiều' }
          ]}
          placeholder="Sắp xếp theo yêu thích"
          isClearable
          onChange={(opt) => handleFilterChange('favoriteSort', opt ? opt.value : '')}
        />
       
      </div>

      {/* Danh sách job */}
      <div className="home-job-listings row">
        {jobs.map((job) => (
          <div className="col-md-4 mb-3" key={job.id}>
            <Card className="position-relative">
              <div
                className="favorite-icon"
                onClick={() => toggleFavorite(job.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                  color: favorites.includes(job.id) ? 'red' : 'gray',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255,255,255,0.8)',
                  padding: '3px 6px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              >
                <i className={favorites.includes(job.id) ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
                <span>{job.favorite_count || 0}</span>
              </div>
              <Card.Body>
                <Card.Title style={{ textAlign: 'center' }}>{job.title}</Card.Title>
                <Card.Text>
                  <strong>Vị trí công việc:</strong> {job.job_position}
                  <br />
                  <strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}
                  <br />
                  <strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}
                  <br />
                  <strong>Địa chỉ:</strong> {job.location}
                  <br />
                  <strong>Mức lương:</strong> {job.salary ? `${job.salary} VND` : 'Chưa có'}
                  <br />
                  <strong>Ngày hết hạn:</strong>{' '}
                  {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}
                </Card.Text>
                <div className="d-flex gap-2">
                  <Button variant="info" onClick={() => handleViewDetail(job.id)}>Xem chi tiết</Button>
                  <Button variant="success" onClick={() => handleApply(job.id)}>Ứng tuyển</Button>
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
