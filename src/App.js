import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import PostJob from './components/PostJob'; // Import component PostJob

function App() {
  return (
    <Router>
      <div>
        {/* Navigation Menu */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">HRM</Link>
            <div className="navbar-nav">
              <Link className="nav-link" to="/login">Đăng Nhập</Link>
              <Link className="nav-link" to="/register">Đăng Ký</Link>
              <Link className="nav-link" to="/post-job">Đăng Tin</Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/" element={<Login />} /> {/* Trang mặc định */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;