import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { TokenContext } from '../App'; // chỉnh đường dẫn nếu file khác

const ManageCandidates = () => {
  const token = useContext(TokenContext) || localStorage.getItem('admin_token');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/candidates/get-all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(res.data);
      } catch (err) {
        console.error('Error fetching candidates:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Lỗi khi tải ứng viên');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa ứng viên này?')) return;
    try {
      await axios.delete(`http://localhost:3001/candidates/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting candidate:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Lỗi khi xóa ứng viên');
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Quản lý ứng viên</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Phone</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.id}>
              <td>{candidate.id}</td>
              <td>{candidate.full_name}</td>
              <td>{candidate.phone || 'Chưa có'}</td>
              <td>{candidate.address || 'Chưa có'}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(candidate.id)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {candidates.length === 0 && <p>Không có ứng viên nào.</p>}
    </div>
  );
};

export default ManageCandidates;
