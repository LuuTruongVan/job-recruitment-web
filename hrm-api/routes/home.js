import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import PostJob from './components/PostJob';
import JobList from './components/JobList';
import ManageJobs from './components/ManageJobs';
import Home from './components/Home'; // Import Home component
import axios from 'axios';
import logo from './assets/img/logo.jpg';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      const token = localStorage.getItem('employer_token');
      console.log('Checking token:', token);
      if (token) {
        axios.get('/users/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          console.log('User data from API:', response.data);
          setUser(response.data);
        }).catch(error => {
          console.error('Profile error:', error.response?.status, error.response?.data || error.message);
          localStorage.removeItem('employer_token');
          setUser(null);
        });
      } else {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);

    return () => window.removeEventListener('storage', updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('employer_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="app">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <img src={logo} alt="Logo" style={{ width: '50px' }} />
          <div className="navbar-nav ms-auto">
            {user ? (
              <>
                <div className="nav-item dropdown">
                  <span
                    className="nav-link dropdown-toggle"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Xin chào, {user.email || 'Người dùng'}
                  </span>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li><button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button></li>
                  </ul>
                </div>
                {user.role === 'employer' && (
                  <Link className="nav-link" to="/post-job">Đăng tin</Link>
                )}
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Đăng Nhập</Link>
                <Link className="nav-link" to="/register">Đăng Ký</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} /> {/* Trang Home làm trang mặc định */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-job" element={user?.role === 'employer' ? <PostJob /> : <JobList />} />
        </Routes>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}