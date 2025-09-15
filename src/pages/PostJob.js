import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import '../assets/css/PostJob.css';

const provincesVN = [
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'An Giang', label: 'An Giang' },
  { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' },
  { value: 'Bắc Giang', label: 'Bắc Giang' },
  { value: 'Bắc Ninh', label: 'Bắc Ninh' },
  { value: 'Bình Dương', label: 'Bình Dương' },
  { value: 'Bình Phước', label: 'Bình Phước' },
  { value: 'Bình Thuận', label: 'Bình Thuận' },
  { value: 'Cà Mau', label: 'Cà Mau' },
  { value: 'Đắk Lắk', label: 'Đắk Lắk' },
  { value: 'Đắk Nông', label: 'Đắk Nông' },
  { value: 'Điện Biên', label: 'Điện Biên' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Đồng Tháp', label: 'Đồng Tháp' },
  { value: 'Gia Lai', label: 'Gia Lai' },
  { value: 'Hà Giang', label: 'Hà Giang' },
  { value: 'Hà Nam', label: 'Hà Nam' },
  { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
  { value: 'Hải Dương', label: 'Hải Dương' },
  { value: 'Hậu Giang', label: 'Hậu Giang' },
  { value: 'Hòa Bình', label: 'Hòa Bình' },
  { value: 'Hưng Yên', label: 'Hưng Yên' },
  { value: 'Khánh Hòa', label: 'Khánh Hòa' },
  { value: 'Kiên Giang', label: 'Kiên Giang' },
  { value: 'Kon Tum', label: 'Kon Tum' },
  { value: 'Lâm Đồng', label: 'Lâm Đồng' },
  { value: 'Lạng Sơn', label: 'Lạng Sơn' },
  { value: 'Lào Cai', label: 'Lào Cai' },
  { value: 'Long An', label: 'Long An' },
  { value: 'Nam Định', label: 'Nam Định' }
];

const PostJob = () => {
  const [job, setJob] = useState({
    title: '',
    company_name: '',
    jobInfo: `• Vị trí tuyển dụng :\n• Số lượng tuyển dụng :\n• Hình thức làm việc :\n• Kinh nghiệm làm việc :\n• Bằng cấp :\n• Hình thức trả lương :\n• Giờ làm việc :\n• Địa điểm làm việc :`,
    jobPositionId: '',
    jobRequirements: `•\n•\n•\n`,
    benefits: `•\n•\n•\n`,
    location: '',
    emailContact: '',
    salary: '',
    category: '',
    expiry_date: '',
    employmentType: '',
    job_image: null // Thêm trường ảnh
  });

  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTermCategory, setSearchTermCategory] = useState('');
  const [jobPositions, setJobPositions] = useState([]);
  const [searchTermPosition, setSearchTermPosition] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target) {
      if (e.target.name === 'job_image') {
        setJob((prevJob) => ({ ...prevJob, [e.target.name]: e.target.files[0] }));
      } else {
        setJob((prevJob) => ({ ...prevJob, [e.target.name]: e.target.value }));
      }
    }
  };

  const handleCategoryChange = (selectedOption) => {
    setJob((prevJob) => ({ ...prevJob, category: selectedOption ? selectedOption.value : '', jobPositionId: '' }));
    setJobPositions([]);
    if (selectedOption) {
      fetchJobPositions(selectedOption.value);
    }
  };

  const handlePositionChange = (selectedOption) => {
    setJob((prevJob) => ({ ...prevJob, jobPositionId: selectedOption ? selectedOption.value : '' }));
  };

  const handleEmploymentTypeChange = (selectedOption) => {
    setJob((prevJob) => ({ ...prevJob, employmentType: selectedOption ? selectedOption.value : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('employer_token');
    if (!token) {
      setMessage('Vui lòng đăng nhập với vai trò employer!');
      return;
    }

    const jobDataToSave = new FormData();
    jobDataToSave.append('title', job.title || '');
    jobDataToSave.append('company_name', job.company_name || '');
    jobDataToSave.append('jobInfo', job.jobInfo || '');
    jobDataToSave.append('jobPositionId', job.jobPositionId || '');
    jobDataToSave.append('jobRequirements', job.jobRequirements || '');
    jobDataToSave.append('benefits', job.benefits || '');
    jobDataToSave.append('salary', job.salary ? parseFloat(job.salary) : 0);
    jobDataToSave.append('category', job.category || '');
    jobDataToSave.append('location', job.location || '');
    jobDataToSave.append('emailContact', job.emailContact || '');
    jobDataToSave.append('expiry_date', job.expiry_date || null);
    jobDataToSave.append('employmentType', job.employmentType || '');
    if (job.job_image) {
      jobDataToSave.append('job_image', job.job_image); 
    }

    try {
      await axios.post('/jobposts', jobDataToSave, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Đăng tin thành công!');
      navigate('/home');
      setJob({
        title: '',
        company_name: '',
        jobInfo: `- Vị trí tuyển dụng :\n- Số lượng tuyển dụng :\n- Hình thức làm việc :\n- Kinh nghiệm làm việc :\n- Bằng cấp :\n- Hình thức trả lương :\n- Giờ làm việc :\n- Địa điểm làm việc :`,
        jobPositionId: '',
        jobRequirements: `- ...\n- ...\n- ...`,
        benefits: `- ...\n- ...\n- ...`,
        location: '',
        emailContact: '',
        salary: '',
        category: '',
        expiry_date: '',
        employmentType: '',
        job_image: null 
      });
    } catch (error) {
      setMessage('Lỗi khi đăng tin: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchJobPositions = async (categoryName) => {
    try {
      const response = await axios.get(`/jobposts/job-positions?category=${encodeURIComponent(categoryName)}`);
      setJobPositions(response.data.map(pos => ({ value: pos.id, label: pos.name })));
    } catch (error) {
      console.error('Error fetching job positions:', error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data.map(cat => ({ value: cat.name, label: cat.name })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleAddNewCategory = async () => {
    if (!searchTermCategory || categories.some(cat => cat.value.toLowerCase() === searchTermCategory.toLowerCase())) return;
    try {
      await axios.post('/categories', { name: searchTermCategory }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('employer_token')}` }
      });
      setCategories([...categories, { value: searchTermCategory, label: searchTermCategory }]);
      setJob((prevJob) => ({ ...prevJob, category: searchTermCategory }));
      setSearchTermCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddNewPosition = async () => {
    if (!searchTermPosition || jobPositions.some(pos => pos.label.toLowerCase() === searchTermPosition.toLowerCase())) return;
    const currentCategory = job.category;
    if (!currentCategory) {
      console.error('Please select a category first');
      return;
    }
    try {
      const response = await axios.post('/jobposts/job-positions', { name: searchTermPosition, category: currentCategory }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('employer_token')}` }
      });
      setJobPositions([...jobPositions, { value: response.data.id, label: searchTermPosition }]);
      setJob((prevJob) => ({ ...prevJob, jobPositionId: response.data.id }));
      setSearchTermPosition('');
    } catch (error) {
      console.error('Error adding job position:', error);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchTermCategory.toLowerCase())
  );
  const filteredJobPositions = jobPositions.filter(pos =>
    pos.label.toLowerCase().includes(searchTermPosition.toLowerCase())
  );

  const employmentTypeOptions = [
    { value: 'Full-time', label: 'Toàn thời gian' },
    { value: 'Part-time', label: 'Bán thời gian' },
    { value: 'Internship', label: 'Thực tập sinh' }
  ];

  return (
    <div className="post-job">
      <h2>Đăng tin tuyển dụng</h2>
      {message && <p className={message.includes('thành công') ? 'success-message' : 'error-message'}>{message}</p>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Phân loại</Form.Label>
          <Select
            value={categories.find(cat => cat.value === job.category) || null}
            onChange={handleCategoryChange}
            onInputChange={setSearchTermCategory}
            options={filteredCategories}
            placeholder="Tìm hoặc thêm phân loại..."
            isClearable
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTermCategory) {
                handleAddNewCategory();
              }
            }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Vị trí công việc</Form.Label>
          <Select
            value={jobPositions.find(pos => pos.value === job.jobPositionId) || null}
            onChange={handlePositionChange}
            onInputChange={setSearchTermPosition}
            options={filteredJobPositions}
            placeholder="Chọn hoặc thêm vị trí công việc..."
            isClearable
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTermPosition) {
                handleAddNewPosition();
              }
            }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tiêu đề</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={job.title}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tên công ty</Form.Label>
          <Form.Control
            type="text"
            name="company_name"
            value={job.company_name}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Ảnh đại diện bài đăng</Form.Label>
          <Form.Control
            type="file"
            name="job_image"
            accept="image/*" // Chỉ cho phép upload ảnh
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Thông tin công việc</Form.Label>
          <Form.Control
            as="textarea"
            name="jobInfo"
            value={job.jobInfo}
            onChange={handleChange}
            rows={8}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Yêu cầu công việc</Form.Label>
          <Form.Control
            as="textarea"
            name="jobRequirements"
            value={job.jobRequirements}
            onChange={handleChange}
            rows={6}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Quyền lợi</Form.Label>
          <Form.Control
            as="textarea"
            name="benefits"
            value={job.benefits}
            onChange={handleChange}
            rows={6}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Lương (VND)</Form.Label>
          <Form.Control
            type="number"
            name="salary"
            value={job.salary}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Địa chỉ</Form.Label>
          <Select
            value={provincesVN.find(p => p.value === job.location) || null}
            onChange={(selectedOption) =>
              setJob((prevJob) => ({ ...prevJob, location: selectedOption ? selectedOption.value : '' }))
            }
            options={provincesVN}
            placeholder="Chọn tỉnh/thành..."
            isClearable
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email liên hệ</Form.Label>
          <Form.Control
            type="email"
            name="emailContact"
            value={job.emailContact}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Trạng thái làm việc</Form.Label>
          <Select
            value={employmentTypeOptions.find(opt => opt.value === job.employmentType) || null}
            onChange={handleEmploymentTypeChange}
            options={employmentTypeOptions}
            placeholder="Chọn trạng thái làm việc..."
            isClearable
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Ngày hết hạn</Form.Label>
          <Form.Control
            type="date"
            name="expiry_date"
            value={job.expiry_date}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Đăng tin</Button>
      </Form>
    </div>
  );
};

export default PostJob;