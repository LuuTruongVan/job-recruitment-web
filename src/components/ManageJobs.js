import React, { useState, useEffect } from 'react';
import { Table, Button, Collapse } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [expiredJobs, setExpiredJobs] = useState([]);
  const [openExpired, setOpenExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentDate = new Date('2025-08-06T00:30:00+07:00'); // Cập nhật thời gian
    const token = localStorage.getItem('employer_token');
    axios.get('/jobposts/my-jobs', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      const jobsWithPositions = await Promise.all(response.data.map(async (job) => {
        if (job.job_position_id) {
          try {
            const positionResponse = await axios.get(`/jobposts/job-positions/${job.job_position_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            job.job_position = positionResponse.data.name || 'Chưa có vị trí';
          } catch (error) {
            console.error('Error fetching job position:', error);
            job.job_position = 'Chưa có vị trí';
          }
        } else {
          job.job_position = 'Chưa có vị trí';
        }
        return job;
      }));
      setJobs(jobsWithPositions);

      const expired = jobsWithPositions.filter(job => job.expiry_date && new Date(job.expiry_date) < currentDate);
      setExpiredJobs(expired);
    }).catch(error => {
      console.error('Error fetching jobs:', error);
    });
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('employer_token');
    try {
      await axios.delete(`/jobposts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs.filter(job => job.id !== id));
      setExpiredJobs(expiredJobs.filter(job => job.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-job/${id}`);
  };

  const handleViewDetail = (id) => {
    navigate(`/job-management-detail/${id}`);
  };

  return (
    <div className="manage-jobs">
      <h2>Quản lý tin tuyển dụng</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Vị trí công việc</th>
            <th>Ngày đăng</th>
            <th>Ngày hết hạn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.job_position || 'Chưa có vị trí'}</td>
              <td>{new Date(job.created_at).toLocaleDateString()}</td>
              <td>{job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</td>
              <td>
                <Button variant="info" size="lg" onClick={() => handleViewDetail(job.id)} className="me-2 mb-1 w-100">Xem chi tiết</Button>
                <Button variant="warning" onClick={() => handleEdit(job.id)} className="me-2 mb-1 w-50">Sửa</Button>
                <Button variant="danger" onClick={() => handleDelete(job.id)} className="w-50">Xóa</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button
        variant="info"
        onClick={() => setOpenExpired(!openExpired)}
        aria-controls="expired-jobs"
        aria-expanded={openExpired}
        className="mt-3"
      >
        Các bài đăng hết hạn
      </Button>
      <Collapse in={openExpired}>
        <div id="expired-jobs">
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Vị trí công việc</th>
                <th>Ngày đăng</th>
                <th>Ngày hết hạn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {expiredJobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.job_position || 'Chưa có vị trí'}</td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td>{job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</td>
                  <td>
                    <Button variant="info" size="lg" onClick={() => handleViewDetail(job.id)} className="me-2 mb-1 w-100">Xem chi tiết</Button>
                    <Button variant="warning" onClick={() => handleEdit(job.id)} className="me-2 mb-1 w-50">Sửa</Button>
                    <Button variant="danger" onClick={() => handleDelete(job.id)} className="w-50">Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Collapse>
    </div>
  );
};

export default ManageJobs;