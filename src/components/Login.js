import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic mẫu (thay bằng API sau)
    if (email === 'test@example.com' && password === '123456') {
      alert('Đăng nhập thành công! (Mẫu)');
    } else {
      setError('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src="https://via.placeholder.com/100?text=HRM+Logo" alt="HRM Logo" className="img-fluid" />
          <h2 className="mt-3 text-primary">Đăng nhập</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email hoặc Số điện thoại</label>
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
          <button type="submit" className="btn btn-primary w-100 mb-3">Đăng nhập</button>
          <div className="d-flex justify-content-between">
            <a href="#" className="text-decoration-none text-primary">Quên mật khẩu?</a>
            <a href="/register" className="text-decoration-none text-primary">Đăng ký</a>
          </div>
        </form>
        {error && <div className="text-danger mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default Login;