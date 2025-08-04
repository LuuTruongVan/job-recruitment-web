import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const Register = () => {
  const [userData, setUserData] = useState({ email: '', password: '', role: 'candidate' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      console.log('Sending register request to /users/add:', userData); // Log để debug
      const response = await axios.post('/users/add', userData);
      if (response.status === 201) {
        setMessage('Đăng ký thành công!');
        setUserData({ email: '', password: '', role: 'candidate' });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi đăng ký!');
      console.error('Register error:', error.response?.data || error.message); // Log lỗi
    }
  };

  return (
    <div className="container mt-4">
      <h2>Đăng Ký</h2>
      {message && <Alert variant="danger">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Control
            as="select"
            name="role"
            value={userData.role}
            onChange={handleChange}
            required
          >
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit">Đăng Ký</Button>
      </Form>
    </div>
  );
};

export default Register;