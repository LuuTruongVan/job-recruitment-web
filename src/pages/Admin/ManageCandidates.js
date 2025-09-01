import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import { TokenContext } from '../../App';
import '../../assets/css/AdminResponsive.css';

const ManageCandidates = () => {
  const token = useContext(TokenContext) || localStorage.getItem('admin_token');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/candidates/get-all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCandidates(res.data);
      } catch (err) {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa ứng viên');
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchName = c.full_name?.toLowerCase().includes(searchName.toLowerCase());
    const matchPhone = c.phone?.toLowerCase().includes(searchPhone.toLowerCase());
    return matchName && matchPhone;
  });

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="table-container">
      <h2>Quản lý ứng viên</h2>

      <div className="filter-container">
        <Form.Control
          placeholder="Tìm theo tên..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="filter-input"
        />
        <Form.Control
          placeholder="Tìm theo số điện thoại..."
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          className="filter-input"
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((candidate) => (
            <tr key={candidate.id}>
              <td data-label="ID">{candidate.id}</td>
              <td data-label="Tên">{candidate.full_name}</td>
              <td data-label="Phone">{candidate.phone || 'Chưa có'}</td>
              <td data-label="Email">{candidate.email || 'Chưa có'}</td>
              <td data-label="Hành động">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(candidate.id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredCandidates.length === 0 && <p>Không tìm thấy ứng viên.</p>}
    </div>
  );
};

export default ManageCandidates;