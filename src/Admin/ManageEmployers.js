import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import { TokenContext } from '../App';
import '../componentCss/AdminResponsive.css';
const ManageEmployers = () => {
  const token = useContext(TokenContext) || localStorage.getItem('admin_token');
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bộ lọc
  const [companySearch, setCompanySearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/employers/get-all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployers(res.data);
      } catch (err) {
        console.error('Error fetching employers:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Lỗi khi tải nhà tuyển dụng');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployers();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhà tuyển dụng này?')) return;
    try {
      await axios.delete(`http://localhost:3001/employers/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployers(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting employer:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Lỗi khi xóa nhà tuyển dụng');
    }
  };

  // Lọc kết quả
  const filteredEmployers = employers.filter(e => {
    const matchCompany = companySearch
      ? e.name?.toLowerCase().includes(companySearch.toLowerCase())
      : true;
    const matchPhone = phoneSearch
      ? e.phone?.toLowerCase().includes(phoneSearch.toLowerCase())
      : true;
    return matchCompany && matchPhone;
  });

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Quản lý nhà tuyển dụng</h2>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <Form.Control
          placeholder="Tìm theo tên công ty..."
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          style={{ width: '250px' }}
        />
        <Form.Control
          placeholder="Tìm theo số điện thoại..."
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
          style={{ width: '250px' }}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên công ty</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
  {filteredEmployers.map(employer => (
    <tr key={employer.id}>
      <td data-label="ID">{employer.id}</td>
      <td data-label="Tên công ty">{employer.name}</td>
      <td data-label="Phone">{employer.phone || 'Chưa có'}</td>
      <td data-label="Email">{employer.email || 'Chưa có'}</td>
      <td data-label="Hành động">
        <Button variant="danger" size="sm" onClick={() => handleDelete(employer.id)}>
          Xóa
        </Button>
      </td>
    </tr>
  ))}
</tbody>

      </Table>

      {filteredEmployers.length === 0 && <p>Không tìm thấy nhà tuyển dụng.</p>}
    </div>
  );
};

export default ManageEmployers;
