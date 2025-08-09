import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { TokenContext } from '../App';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';

const ManageJobPosts = () => {
  const token = useContext(TokenContext);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/jobposts/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pending = res.data.filter((job) => job.status === 'pending');
      const approved = res.data.filter((job) => job.status === 'approved');
      setPendingPosts(pending);
      setApprovedPosts(approved);
    } catch (err) {
      console.error('Error fetching job posts:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Cập nhật cả 2 danh sách
      setPendingPosts((prev) => prev.filter((job) => job.id !== id));
      setApprovedPosts((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error('Error rejecting post:', err);
      alert('Không thể xóa bài đăng');
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="manage-job-posts p-3">
      <h3>Bài đăng chờ duyệt</h3>
      <Table striped bordered hover>
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
              <td>{job.title}</td>
              <td>{job.category}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td>{new Date(job.created_at).toLocaleString()}</td>
              <td>
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
<Table striped bordered hover>
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
        <td>{job.title}</td>
        <td>{job.category}</td>
        <td>{job.location}</td>
        <td>{job.salary}</td>
        <td>{new Date(job.created_at).toLocaleString()}</td>
        <td>
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
