import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import '../componentCss/JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('employer_token');
    axios.get(`/jobposts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      const jobData = response.data;
      console.log('Job data from API:', jobData);
      if (jobData.job_position_id) {
        try {
          const positionResponse = await axios.get(`/jobposts/job-positions/${jobData.job_position_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          jobData.job_position = positionResponse.data.name || 'Chưa có vị trí';
        } catch (error) {
          console.error('Error fetching job position:', error);
          jobData.job_position = 'Chưa có vị trí';
        }
      } else {
        jobData.job_position = 'Chưa có vị trí';
      }
      setJob(jobData);
    }).catch(error => {
      console.error('Error fetching job detail:', error);
      setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
    });
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!job) return <p>Đang tải...</p>;

  return (
    <div className="job-detail-container">
        <h2>{job.title}</h2>
      <p><strong>Tên công ty:</strong> {job.company_name || 'Chưa có'}</p> 
      
      <p><strong>Vị trí công việc:</strong> {job.job_position || 'Chưa có vị trí'}</p> 
      <p><strong>Thông tin công việc:</strong> {job.job_info || 'Chưa có thông tin'}</p>
      <p><strong>Yêu cầu công việc:</strong> {job.job_requirements || 'Chưa có yêu cầu'}</p>
      <p><strong>Quyền lợi:</strong> {job.benefits || 'Chưa có quyền lợi'}</p>
      <p><strong>Lương:</strong> {job.salary} VND</p>
      <p><strong>Phân loại:</strong> {job.category}</p>
      <p><strong>Địa chỉ:</strong> {job.location}</p>
      <p><strong>Email liên hệ:</strong> {job.email_contact || 'Chưa có email'}</p>
      <p><strong>Ngày đăng:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
      <p><strong>Ngày hết hạn:</strong> {job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</p>
      <Button variant="secondary" onClick={() => navigate('/home')}>Quay lại</Button>
    </div>
  );
};

export default JobDetail;