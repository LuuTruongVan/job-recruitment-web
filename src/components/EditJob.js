import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import { useParams, useNavigate } from 'react-router-dom';
import '../componentCss/PostJob.css';

const EditJob = () => {
  const { id } = useParams();
  const [job, setJob] = useState({
    title: '',
    company_name: '',
    jobInfo: '',
    jobPositionId: '',
    jobRequirements: '',
    benefits: '',
    location: '',
    emailContact: '',
    salary: '',
    category: '',
    expiry_date: ''
  });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTermCategory, setSearchTermCategory] = useState('');
  const [jobPositions, setJobPositions] = useState([]);
  const [searchTermPosition, setSearchTermPosition] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('employer_token');
    axios.get(`/jobposts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      const jobData = response.data;
      setJob({
        title: jobData.title || '',
        company_name: jobData.company_name || '',
        jobInfo: jobData.job_info || '',
        jobPositionId: jobData.job_position_id || '',
        jobRequirements: jobData.job_requirements || '',
        benefits: jobData.benefits || '',
        location: jobData.location || '',
        emailContact: jobData.email_contact || '',
        salary: jobData.salary || '',
        category: jobData.category || '',
        expiry_date: jobData.expiry_date || ''
      });
      if (jobData.category) {
        fetchJobPositions(jobData.category);
      }
    }).catch(error => {
      console.error('Error fetching job:', error);
      setMessage('Không thể tải thông tin công việc.');
    });

    axios.get('/categories').then(response => {
      setCategories(response.data.map(cat => ({ value: cat.name, label: cat.name })));
    }).catch(error => {
      console.error('Error fetching categories:', error);
    });
  }, [id]);

  const handleChange = (e) => {
    if (e.target) {
      setJob((prevJob) => ({ ...prevJob, [e.target.name]: e.target.value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('employer_token');
    const jobDataToSave = {
      title: job.title || '',
      company_name: job.company_name || '',
      jobInfo: job.jobInfo || '',
      jobPositionId: job.jobPositionId || null,
      jobRequirements: job.jobRequirements || '',
      benefits: job.benefits || '',
      salary: job.salary ? parseFloat(job.salary) : 0,
      category: job.category || '',
      location: job.location || '',
      emailContact: job.emailContact || '',
      expiry_date: job.expiry_date || null
    };
    console.log('Sending job data for update:', jobDataToSave); // Debug dữ liệu gửi đi
    try {
      const response = await axios.put(`/jobposts/${id}`, jobDataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Server response:', response.data); // Debug phản hồi từ server
      setMessage('Cập nhật tin thành công!');
      setTimeout(() => navigate('/manage-posts'), 1000);
    } catch (error) {
      console.error('Update job error:', error.response?.data || error.message); // Debug lỗi
      setMessage('Lỗi khi cập nhật tin: ' + (error.response?.data?.message || error.message));
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

  const handleAddNewCategory = async () => {
    if (!searchTermCategory || categories.some(cat => cat.value.toLowerCase() === searchTermCategory.toLowerCase())) return;
    try {
      const token = localStorage.getItem('employer_token');
      await axios.post('/categories', { name: searchTermCategory }, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('employer_token');
      const response = await axios.post('/jobposts/job-positions', { name: searchTermPosition, category: currentCategory }, {
        headers: { Authorization: `Bearer ${token}` }
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

  return (
    <div className="post-job">
      <h2>Cập nhật tin tuyển dụng</h2>
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
          <Form.Label>Thông tin công việc</Form.Label>
          <Form.Control
            as="textarea"
            name="jobInfo"
            value={job.jobInfo}
            onChange={handleChange}
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
          <Form.Control
            type="text"
            name="location"
            value={job.location}
            onChange={handleChange}
            required
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
          <Form.Label>Ngày hết hạn</Form.Label>
          <Form.Control
            type="date"
            name="expiry_date"
            value={job.expiry_date}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">Cập nhật</Button>
          <Button variant="secondary" onClick={() => navigate('/manage-posts')}>Hủy</Button>
        </div>
      </Form>
    </div>
  );
};

export default EditJob;