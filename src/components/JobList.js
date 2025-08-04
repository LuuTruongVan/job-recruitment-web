import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get('/jobposts').then(response => {
      setJobs(response.data);
    }).catch(error => {
      console.error('Error fetching jobs:', error);
    });
  }, []);

  return (
    <div className="job-list">
      <h2>Danh sách công việc</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Ngày đăng</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>{new Date(job.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default JobList;