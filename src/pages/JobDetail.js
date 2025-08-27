import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import ApplyModal from '../component/ApplyModal'; // Import component ApplyModal
import '../assets/css/JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
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

  const [companyInfo, setCompanyInfo] = useState(null);

  const navigate = useNavigate();
  const token =
    localStorage.getItem('candidate_token') ||
    localStorage.getItem('employer_token') ||
    localStorage.getItem('admin_token');

  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await axios.get(`/favorites/count/${id}`);
      return res.data.count || 0;
    } catch {
      return 0;
    }
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobResponse = await axios.get(`/jobposts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const jobData = jobResponse.data;
        console.log('Job data:', jobData); // Kiểm tra dữ liệu

        jobData.favorite_count = await fetchFavoriteCount();

        if (jobData.job_position_id) {
          try {
            const positionResponse = await axios.get(
              `/jobposts/job-positions/${jobData.job_position_id}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            jobData.job_position = positionResponse.data.name || 'Chưa có vị trí';
          } catch {
            jobData.job_position = 'Chưa có vị trí';
          }
        } else {
          jobData.job_position = 'Chưa có vị trí';
        }

        const companyResponse = await axios.get(`/employers/public/${jobData.employer_id}`);
        setCompanyInfo(companyResponse.data);

        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job detail:', err);
        setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      }
    };

    const fetchUser = async () => {
      if (!token) return;
      try {
        const userResponse = await axios.get('/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        const favRes = await axios.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(favRes.data.some(fav => fav.id === parseInt(id)));
      } catch {}
    };

    fetchJob();
    fetchUser();
  }, [id, token, fetchFavoriteCount]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      return;
    }
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
      const updatedCount = await fetchFavoriteCount();
      setJob(prev => ({ ...prev, favorite_count: updatedCount }));
    } catch {}
  };

  const handleApplyClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để ứng tuyển!');
      return;
    }
    if (user.role === 'employer') {
      alert('Tài khoản công ty không thể ứng tuyển!');
      return;
    }
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
    data.append('jobpost_id', id);

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
      setApplyMessage(`Lỗi ứng tuyển: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
    }
  };

  if (error) return <p>{error}</p>;
  if (!job || !companyInfo) return <p>Đang tải...</p>;

  return (
    <div className="job-detail-container">
      {/* Phần thông tin công ty với background image */}
      <div
        className="company-header"
        style={{
          backgroundImage: job.job_image ? `url(${job.job_image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {companyInfo.avatar_url && (
          <img
            src={companyInfo.avatar_url}
            alt="Company Avatar"
            className="company-avatar"
          />
        )}
        <div className="company-info">
          <h3>{companyInfo.name}</h3>
          <p><strong>Địa chỉ:</strong> {companyInfo.address}</p>
          <p><strong>Số điện thoại:</strong> {companyInfo.phone || 'Chưa có'}</p>
          <p><strong>Email:</strong> {companyInfo.email}</p>
          <p><strong>Website:</strong> <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">{companyInfo.website}</a></p>
          <p><strong>Giới thiệu:</strong> {companyInfo.company_intro}</p>
        </div>
      </div>

      {/* Phần nội dung không cần background image */}
      <div className="job-content">
        <div className="job-header">
          <div>
            <h2>{job.title}</h2>
            <p className="company-name">{job.company_name || 'Chưa có'}</p>
          </div>
          <div className="favorite-btn" onClick={toggleFavorite}>
            <i className={isFavorite ? 'bi bi-heart-fill text-danger' : 'bi bi-heart text-secondary'}></i>
            <span>{job.favorite_count || 0}</span>
          </div>
        </div>

        <div className="job-info-grid">
          <div>
            <p><strong>Vị trí:</strong> {job.job_position}</p>
            <p><strong>Hình thức:</strong> {job.employment_type || 'Chưa có'}</p>
            <p>
              <strong>Lương:</strong>{' '}
              {job.salary
                ? `${parseInt(job.salary, 10).toLocaleString('vi-VN')} VND`
                : 'Chưa có'}
            </p>
            <p><strong>Địa chỉ:</strong> {job.location}</p>
          </div>
          <div>
            <p><strong>Email liên hệ:</strong> {job.email_contact || 'Chưa có email'}</p>
            <p><strong>Ngày đăng:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
            <p><strong>Hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</p>
            <p><strong>Phân loại:</strong> {job.category}</p>
          </div>
        </div>

        <div className="">
          <h5>Thông tin công việc</h5>
          <p style={{ whiteSpace: 'pre-line' }}>{job.job_info || 'Chưa có thông tin'}</p>

          <h5>Yêu cầu công việc</h5>
          <p style={{ whiteSpace: 'pre-line' }}>{job.job_requirements || 'Chưa có yêu cầu'}</p>

          <h5>Quyền lợi</h5>
          <p style={{ whiteSpace: 'pre-line' }}>{job.benefits || 'Chưa có quyền lợi'}</p>
        </div>

        <div className="d-flex gap-2 mt-3">
          <Button variant="success" onClick={handleApplyClick}>Ứng tuyển</Button>
          <Button variant="secondary" onClick={() => navigate('/home')}>Quay lại</Button>

          {user?.role === "candidate" && (
            <Button
              variant="primary"
              onClick={async () => {
                if (!user) return alert("Bạn cần đăng nhập!");
                try {
                  const res = await fetch(`http://localhost:3000/candidates/by-user/${user.id}`);
                  if (!res.ok) {
                    alert("Không tìm thấy thông tin candidate!");
                    return;
                  }
                  const candData = await res.json();
                  const candidate_id = candData.id;

                  const convRes = await fetch("http://localhost:3000/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ candidate_id, employer_id: job.employer_id })
                  });

                  if (!convRes.ok) {
                    alert("Lỗi khi tạo cuộc trò chuyện!");
                    return;
                  }

                  const conv = await convRes.json();
                  navigate(`/chat/${conv.id}`, { replace: false });
                } catch (err) {
                  console.error(err);
                  alert("Có lỗi xảy ra. Vui lòng thử lại.");
                }
              }}
            >
              Chat với nhà tuyển dụng
            </Button>
          )}
        </div>
      </div>

      {/* Sử dụng component ApplyModal */}
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

export default JobDetail;