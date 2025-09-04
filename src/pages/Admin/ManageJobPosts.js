import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import Select from 'react-select';
import '../../assets/css/AdminResponsive.css';

const provinces = [
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh",
  "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái", "Phú Yên"
];

const ManageJobPosts = () => {
  const token = localStorage.getItem('admin_token');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/categories')
      .then(res => {
        setCategories(res.data.map(cat => ({ value: cat.name, label: cat.name })));
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const fetchJobPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/jobposts/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = res.data;

      if (filters.category) {
        data = data.filter(job => job.category === filters.category);
      }
      if (filters.location) {
        data = data.filter(job => job.location === filters.location);
      }

      const pending = data.filter((job) => job.status === 'pending');
      const approved = data.filter((job) => job.status === 'approved');

      setPendingPosts(pending);
      setApprovedPosts(approved);
    } catch (err) {
      console.error('Error fetching job posts:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchJobPosts();
  }, [fetchJobPosts]);

  const approvePost = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/jobposts/admin/${id}/status`,
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPendingPosts((prev) => prev.filter((job) => job.id !== id));
      setApprovedPosts((prev) => [
        ...prev,
        pendingPosts.find((job) => job.id === id),
      ]);
    } catch (err) {
      console.error('Error approving post:', err);
      alert('Không thể duyệt bài đăng');
    }
  };

  const rejectPost = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) return;
    try {
      await axios.delete(`http://localhost:3000/jobposts/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingPosts((prev) => prev.filter((job) => job.id !== id));
      setApprovedPosts((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error('Error rejecting post:', err);
      alert('Không thể xóa bài đăng');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewDetail = async (job) => {
    try {
      const companyResponse = await axios.get(`/employers/public/${job.employer_id}`);
      const companyInfo = companyResponse.data;

      let jobPosition = "Chưa có vị trí";
      if (job.job_position_id) {
        try {
          const positionResponse = await axios.get(`/jobposts/job-positions/${job.job_position_id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          jobPosition = positionResponse.data.name || "Chưa có vị trí";
        } catch {
          jobPosition = "Chưa có vị trí";
        }
      }

      setSelectedJob({
        ...job,
        company_name: companyInfo.name,
        company_address: companyInfo.address,
        company_phone: companyInfo.phone,
        email_contact: companyInfo.email,
        company_website: companyInfo.website,
        company_intro: companyInfo.company_intro,
        company_avatar_url: companyInfo.avatar_url,
        job_position: jobPosition,
      });
    } catch (err) {
      console.error('Error fetching job or company info:', err);
      setSelectedJob({
        ...job,
        company_name: job.company_name || "Chưa có",
        company_address: job.company_address || "Chưa có",
        company_phone: job.company_phone || "Chưa có",
        email_contact: job.email_contact || "Chưa có email",
        company_website: job.company_website || "Chưa có",
        company_intro: job.company_intro || "Chưa có",
        company_avatar_url: job.company_avatar_url || null,
        job_position: job.job_position || "Chưa có vị trí",
      });
    }
    setShowDetailModal(true);
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="table-container">
      <h2>Bộ lọc</h2>
      <div className="filter-container">
        <div className="select-wrapper">
          <Select
            options={categories}
            placeholder="Chọn phân loại"
            isClearable
            onChange={(opt) => handleFilterChange('category', opt ? opt.value : '')}
            className="filter-select"
          />
        </div>
        <div className="select-wrapper">
          <Select
            options={provinces.map(p => ({ value: p, label: p }))}
            placeholder="Chọn địa điểm"
            isClearable
            onChange={(opt) => handleFilterChange('location', opt ? opt.value : '')}
            className="filter-select"
          />
        </div>
      </div>

      <h3>Bài đăng chờ duyệt</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Danh mục</th>
            <th>Địa điểm</th>
            <th>Lương</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingPosts.map((job) => (
            <tr key={job.id}>
              <td data-label="Tiêu đề">{job.title}</td>
              <td data-label="Danh mục">{job.category}</td>
              <td data-label="Địa điểm">{job.location}</td>
              <td data-label="Lương">{job.salary}</td>
              <td data-label="Ngày tạo">
                {new Date(job.created_at).toLocaleString()}
              </td>
              <td data-label="Hành động">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => approvePost(job.id)}
                >
                  Duyệt
                </Button>{' '}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => rejectPost(job.id)}
                >
                  Từ chối
                </Button>{' '}
                <Button
                  variant="info"
                  size="sm"
                  style={{
                    transition: 'transform 0.2s',
                    ':hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={() => handleViewDetail(job)}
                >
                  Xem chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Bài đăng đã duyệt</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Danh mục</th>
            <th>Địa điểm</th>
            <th>Lương</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {approvedPosts.map((job) => (
            <tr key={job.id}>
              <td data-label="Tiêu đề">{job.title}</td>
              <td data-label="Danh mục">{job.category}</td>
              <td data-label="Địa điểm">{job.location}</td>
              <td data-label="Lương">{job.salary}</td>
              <td data-label="Ngày tạo">
                {new Date(job.created_at).toLocaleString()}
              </td>
              <td data-label="Hành động">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => rejectPost(job.id)}
                >
                  Xóa
                </Button>{' '}
                <Button
  variant="info"
  size="sm"
  className="scale-on-hover"
  onClick={() => handleViewDetail(job)}
>
  Xem chi tiết
</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết bài đăng: {selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div className="job-detail-container">
              <div
                className="company-header"
                style={{
                  backgroundImage: selectedJob.job_image ? `url(${selectedJob.job_image})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {selectedJob.company_avatar_url && (
                  <img
                    src={selectedJob.company_avatar_url}
                    alt="Company Avatar"
                    className="company-avatar"
                  />
                )}
                <div className="company-info">
                  <h3>{selectedJob.company_name}</h3>
                  <p><strong>Địa chỉ:</strong> {selectedJob.company_address}</p>
                  <p><strong>Số điện thoại:</strong> {selectedJob.company_phone || "Chưa có"}</p>
                  <p><strong>Email:</strong> {selectedJob.email_contact}</p>
                  <p><strong>Website:</strong> <a href={selectedJob.company_website} target="_blank" rel="noopener noreferrer">{selectedJob.company_website || "Chưa có"}</a></p>
                  <p><strong>Giới thiệu:</strong> {selectedJob.company_intro}</p>
                </div>
              </div>

              <div className="job-content">
                <div className="job-header">
                  <div>
                    <h2>{selectedJob.title}</h2>
                    <p className="company-name">{selectedJob.company_name || "Chưa có"}</p>
                  </div>
                </div>

                <div className="job-info-grid">
                  <div>
                    <p><strong>Vị trí:</strong> {selectedJob.job_position}</p>
                    <p><strong>Hình thức:</strong> {selectedJob.employment_type || "Chưa có"}</p>
                    <p><strong>Lương:</strong> {selectedJob.salary ? `${parseInt(selectedJob.salary, 10).toLocaleString('vi-VN')} VND` : "Chưa có"}</p>
                    <p><strong>Địa chỉ:</strong> {selectedJob.location}</p>
                  </div>
                  <div>
                    <p><strong>Email liên hệ:</strong> {selectedJob.email_contact || "Chưa có email"}</p>
                    <p><strong>Ngày đăng:</strong> {new Date(selectedJob.created_at).toLocaleDateString()}</p>
                    <p><strong>Hết hạn:</strong> {selectedJob.expiry_date ? new Date(selectedJob.expiry_date).toLocaleDateString() : "Chưa có"}</p>
                    <p><strong>Phân loại:</strong> {selectedJob.category}</p>
                  </div>
                </div>

                <div className="job-details-sections">
                  <div className="job-detail-box">
                    <h5>Thông tin công việc</h5>
                    <p style={{ whiteSpace: "pre-line" }}>{selectedJob.job_info || "Chưa có thông tin"}</p>
                  </div>

                  <div className="job-detail-box">
                    <h5>Yêu cầu công việc</h5>
                    <p style={{ whiteSpace: "pre-line" }}>{selectedJob.job_requirements || "Chưa có yêu cầu"}</p>
                  </div>

                  <div className="job-detail-box">
                    <h5>Quyền lợi</h5>
                    <p style={{ whiteSpace: "pre-line" }}>{selectedJob.benefits || "Chưa có quyền lợi"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageJobPosts;