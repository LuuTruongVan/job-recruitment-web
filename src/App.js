import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import PostJob from './components/PostJob';
import JobList from './components/JobList';
import Home from './components/Home';
import axios from 'axios';
import UpdateProfile from './components/UpdateProfile';
import JobDetail from './components/JobDetail';
import ApplyJob from './components/ApplyJob';
import ManageJobs from './components/ManageJobs';
import EditJob from './components/EditJob';

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
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <div className="navbar-nav me-auto">
            <img className="logo" src="/assets/img/logo.jpg" alt="Logo" style={{ width: '100px' }} />
            <Link className="nav-link" to="/home">Trang chủ</Link>
          </div>
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
                    Xin chào, {user.role === 'candidate' ? (user.full_name || 'Người dùng') : (user.name || 'Công ty')}
                  </span>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li><button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button></li>
                    <li><Link className="dropdown-item" to="/update-profile">Cập nhật thông tin</Link></li>
                  </ul>
                </div>
                {user.role === 'employer' && (
                  <Link className="nav-link" to="/post-job">Đăng tin</Link>
                )}
                {user.role === 'employer' && (
                  <Link className="nav-link" to="/manage-posts">Quản lý bài đăng</Link>
                )}
                {user.role === 'candidate' && (
                  <Link className="nav-link" to="/manage-applications">Quản lý ứng tuyển</Link>
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
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-job" element={user?.role === 'employer' ? <PostJob /> : <JobList />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/job-detail/:id" element={<JobDetail />} />
          <Route path="/apply-job/:id" element={<ApplyJob />} />
          <Route path="/manage-posts" element={user?.role === 'employer' ? <ManageJobs /> : <Home />} />
          <Route path="/manage-applications" element={user?.role === 'candidate' ? <JobList /> : <Home />} />
          <Route path="/edit-job/:id" element={user?.role === 'employer' ? <EditJob /> : <Home />} />
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