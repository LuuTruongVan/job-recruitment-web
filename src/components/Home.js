import React, { useState, useEffect, useCallback } from 'react';
import { Carousel, Button, Card, Form, Modal, Alert } from 'react-bootstrap';
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
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [formData, setFormData] = useState({
    candidate_name: '',
    phone: '',
    email: '',
    address: '',
    skills: '',
    introduction: '',
    cv: null
  });

  const navigate = useNavigate();

  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token') ||
    '';

  useEffect(() => {
    axios.get('/categories')
      .then(res => {
        setCategories(res.data.map(cat => ({ value: cat.name, label: cat.name })));
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.minSalary) params.salary = filters.minSalary;

      const response = await axios.get('/jobposts', { params });
      let jobsData = response.data;

      if (filters.favoriteSort === 'desc') {
        jobsData.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
      } else if (filters.favoriteSort === 'asc') {
        jobsData.sort((a, b) => (a.favorite_count || 0) - (b.favorite_count || 0));
      }

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

  const handleApplyClick = (job) => {
    if (!user) {
      alert('Vui lòng đăng nhập để ứng tuyển!');
      return;
    }
    if (user.role === 'employer') {
      alert('Tài khoản công ty không thể ứng tuyển!');
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleFormChange = (e) => {
    if (e.target.name === 'cv') {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    const candidateToken = localStorage.getItem('candidate_token');
    if (!candidateToken) {
      setApplyMessage('Vui lòng đăng nhập với vai trò ứng viên.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('jobpost_id', selectedJob.id);

    try {
      await axios.post('http://localhost:3000/applications/add', data, {
        headers: {
          Authorization: `Bearer ${candidateToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setApplyMessage('Ứng tuyển thành công!');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error applying job:', error.response ? error.response.data : error.message);
      setApplyMessage(`Lỗi ứng tuyển: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  const toggleFavorite = async (jobId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      return;
    }
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
      <div className="home-filters-wrapper">
        <h4 className="home-filters-title">Chọn vị trí mong muốn</h4>
        <div className="home-filters d-flex gap-2 flex-wrap">
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
      </div>

      {/* Danh sách job */}
      <div className="home-job-listings row align-items-stretch">
        {jobs.map((job) => (
          <div className="col-md-4 mb-3 d-flex" key={job.id}>
            <Card className="position-relative flex-fill d-flex flex-column">
              <div
                className="favorite-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(job.id);
                }}
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

              {/* Nội dung chính */}
              <div
                onClick={() => navigate(`/job-detail/${job.id}`)}
                style={{ cursor: 'pointer', flexGrow: 1 }}
              >
                <Card.Body className="d-flex flex-column">
                <Card.Title style={{ textAlign: 'center', margin: '0 30px' }}>{job.title}</Card.Title>
                  <Card.Text className="job-description">
                    <strong>Vị trí công việc:</strong> {job.job_position}
                    <br />
                    <strong>Trạng thái làm việc:</strong> {job.employment_type || 'Chưa có'}
                    <br />
                    <strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}
                    <br />
                    <strong>Địa chỉ:</strong> {job.location}
                    <br />
                    <strong>Mức lương:</strong>{' '}
{job.salary
  ? `${parseInt(job.salary, 10).toLocaleString('vi-VN')} VND`
  : 'Chưa có'}


                    <br />
                    <strong>Ngày hết hạn:</strong>{' '}
                    {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}
                  </Card.Text>
                </Card.Body>
              </div>

              {/* Nút bấm */}
              <div className="d-flex gap-2 p-2">
                <Button variant="info" onClick={() => navigate(`/job-detail/${job.id}`)}>Xem chi tiết</Button>
                <Button variant="success" onClick={() => handleApplyClick(job)}>Ứng tuyển</Button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Modal Apply Job */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ứng tuyển công việc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applyMessage && (
            <Alert variant={applyMessage.includes('thành công') ? 'success' : 'danger'}>
              {applyMessage}
            </Alert>
          )}
          <Form onSubmit={submitApplication}>
            <Form.Group className="mb-3">
              <Form.Label>Tên ứng viên</Form.Label>
              <Form.Control
                type="text"
                name="candidate_name"
                value={formData.candidate_name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kỹ năng</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giới thiệu bản thân</Form.Label>
              <Form.Control
                as="textarea"
                name="introduction"
                value={formData.introduction}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tải CV lên (PDF)</Form.Label>
              <Form.Control
                type="file"
                name="cv"
                accept=".pdf"
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">Gửi ứng tuyển</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
