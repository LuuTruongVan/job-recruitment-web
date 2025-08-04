import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('employer_token');
    axios.get('/jobposts/my-jobs', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setJobs(response.data);
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
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="manage-jobs">
      <h2>Quản lý tin tuyển dụng</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Ngày đăng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>{new Date(job.created_at).toLocaleDateString()}</td>
              <td><Button variant="danger" onClick={() => handleDelete(job.id)}>Xóa</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ManageJobs;