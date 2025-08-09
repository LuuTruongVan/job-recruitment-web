import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { TokenContext } from '../App'; // chỉnh đường dẫn nếu file khác

const ManageEmployers = () => {
  const token = useContext(TokenContext) || localStorage.getItem('admin_token');
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
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

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Quản lý nhà tuyển dụng</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên công ty</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {employers.map(employer => (
            <tr key={employer.id}>
              <td>{employer.id}</td>
              <td>{employer.name}</td>
              <td>{employer.email || 'Chưa có'}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(employer.id)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {employers.length === 0 && <p>Không có nhà tuyển dụng nào.</p>}
    </div>
  );
};

export default ManageEmployers;
