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
      {/* CSS responsive để bảng hiển thị dọc trên mobile */}
      <style>{`
        @media (max-width: 768px) {
          table thead {
            display: none;
          }
          table, table tbody, table tr, table td {
            display: block;
            width: 100%;
          }
          table tr {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            background: #fff;
          }
          table td {
            text-align: left;
            padding: 8px 10px;
            border: none;
            border-bottom: 1px solid #eee;
            position: relative;
          }
          table td:last-child {
            border-bottom: none;
          }
          table td:before {
            content: attr(data-label);
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
            color: #333;
          }
        }
      `}</style>

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
              <td data-label="Tiêu đề">{job.title}</td>
              <td data-label="Vị trí công việc">{job.job_position || 'Chưa có vị trí'}</td>
              <td data-label="Ngày đăng">{new Date(job.created_at).toLocaleDateString()}</td>
              <td data-label="Ngày hết hạn">{job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</td>
              <td data-label="Hành động">
                <Button variant="info" size="sm" onClick={() => handleViewDetail(job.id)} className="me-2 mb-1">
                  Xem chi tiết
                </Button>
                <Button variant="warning" size="sm" onClick={() => handleEdit(job.id)} className="me-2 mb-1">
                  Sửa
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(job.id)}>
                  Xóa
                </Button>
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
                  <td data-label="Tiêu đề">{job.title}</td>
                  <td data-label="Vị trí công việc">{job.job_position || 'Chưa có vị trí'}</td>
                  <td data-label="Ngày đăng">{new Date(job.created_at).toLocaleDateString()}</td>
                  <td data-label="Ngày hết hạn">{job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'Chưa có'}</td>
                  <td data-label="Hành động">
                    <Button variant="info" size="sm" onClick={() => handleViewDetail(job.id)} className="me-2 mb-1">
                      Xem chi tiết
                    </Button>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(job.id)} className="me-2 mb-1">
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(job.id)}>
                      Xóa
                    </Button>
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
