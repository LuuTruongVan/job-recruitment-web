import React, { useState } from 'react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic mẫu
    if (email && password.length >= 6) {
      alert(`Đăng ký thành công với vai trò ${role}! (Mẫu)`);
    } else {
      setError('Email và mật khẩu (tối thiểu 6 ký tự) là bắt buộc');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src="https://via.placeholder.com/100?text=HRM+Logo" alt="HRM Logo" className="img-fluid" />
          <h2 className="mt-3 text-primary">Đăng ký</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="text"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">Vai trò</label>
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="candidate">Ứng viên</option>
              <option value="employer">Nhà tuyển dụng</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">Đăng ký</button>
          <div className="text-center">
            <a href="/login" className="text-decoration-none text-primary">Đăng nhập</a>
          </div>
        </form>
        {error && <div className="text-danger mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default Register;