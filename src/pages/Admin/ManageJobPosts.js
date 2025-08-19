import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { TokenContext } from '../../App';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
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
  const token = useContext(TokenContext);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy category từ API
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

      // Áp dụng bộ lọc
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

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="manage-job-posts p-3">
      <h3>Bộ lọc</h3>
      <div className="d-flex gap-2 flex-wrap mb-3">
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
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

    </div>
  );
};

export default ManageJobPosts;
