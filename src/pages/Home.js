import React, { useState, useEffect, useCallback, useRef } from 'react';
import {  Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import '../assets/css/Home.css';
import ApplyModal from '../component/ApplyModal';
import slide1 from '../assets/img/slide1.jpg'; // Import ảnh slide1
import FavoriteCard from '../component/favorites/FavoriteCard';

const provinces = [
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh",
  "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái", "Phú Yên"
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
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();
  const cardRefs = useRef([]);

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

      // Lọc bài đăng chưa hết hạn
      const currentDate = new Date();
      jobsData = jobsData.filter(job => !job.expiry_date || new Date(job.expiry_date) > currentDate);

      // Lọc bỏ bài đăng không có ảnh khỏi slide
      jobsData = jobsData.map(job => ({
        ...job,
        job_image: job.job_image && job.job_image.trim() !== '' ? job.job_image : null
      }));

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
      setActiveIndex(0); // Reset slide về đầu khi load lại
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

  // Tự động chuyển slide
  useEffect(() => {
    const jobsWithImages = jobs.filter(job => job.job_image);
    if (jobsWithImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % jobsWithImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [jobs]);

  const handlePrevSlide = () => {
    const jobsWithImages = jobs.filter(job => job.job_image);
    setActiveIndex((prevIndex) => (prevIndex - 1 + jobsWithImages.length) % jobsWithImages.length);
  };

  const handleNextSlide = () => {
    const jobsWithImages = jobs.filter(job => job.job_image);
    setActiveIndex((prevIndex) => (prevIndex + 1) % jobsWithImages.length);
  };

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

  // Thêm hiệu ứng scroll
  useEffect(() => {
    const elements = cardRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      elements.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [jobs]);

  return (
    <div className="home-container">
      {/* Job Listings Carousel */}
      <div className="job-carousel mb-4" style={{ backgroundImage: `url(${slide1})` }}>
        <div className="carousel-inner">
          {jobs.filter(job => job.job_image).length > 0 ? (
            jobs.filter(job => job.job_image).map((job, index) => (
              <div
                key={job.id}
                className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
                onClick={() => navigate(`/job-detail/${job.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={job.job_image}
                  className="d-block w-100"
                  alt={job.title}
                />
                <div className="carousel-caption">
                  <h5>{job.title}</h5>
                  <p className="job-position">{job.job_position || 'Chưa có vị trí'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="carousel-item active">
             
              <div className="carousel-caption">
                <h5>Không có bài đăng</h5>
                <p>Vui lòng thử lại sau.</p>
              </div>
            </div>
          )}
        </div>
        {jobs.filter(job => job.job_image).length > 1 && (
          <>
            <button className="carousel-control-prev" onClick={handlePrevSlide}>
              <span className="carousel-control-prev-icon" aria-hidden="true">&lt;</span>
            </button>
            <button className="carousel-control-next" onClick={handleNextSlide}>
              <span className="carousel-control-next-icon" aria-hidden="true">&gt;</span>
            </button>
          </>
        )}
      </div>

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
  {jobs.map((job, index) => (
    <div
      ref={(el) => (cardRefs.current[index] = el)}
      className="col-md-4 mb-3 d-flex"
      key={job.id}
    >
     <FavoriteCard
  job={job}
  navigate={navigate}
  toggleFavorite={toggleFavorite}
  handleApplyClick={handleApplyClick}
  favorites={favorites}
/>
    </div>
  ))}
</div>


      <ApplyModal
        show={showApplyModal}
        onHide={() => setShowApplyModal(false)}
        formData={formData}
        handleFormChange={handleFormChange}
        submitApplication={submitApplication}
        applyMessage={applyMessage}
      />
    </div>
  );
};

export default Home;