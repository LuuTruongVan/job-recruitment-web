import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import PostJob from './components/PostJob';
import ManageApplications from './components/ManageApplications';
import Home from './components/Home';
import axios from 'axios';
import UpdateProfile from './components/UpdateProfile';
import JobDetail from './components/JobDetail';
import ApplyJob from './components/ApplyJob';
import ManageJobs from './components/ManageJobs';
import EditJob from './components/EditJob';
import Profile from './components/Profile';
import ChangePassword from './components/ChangePassword';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Favorites from './components/Favorites';
import JobManagementDetail from './components/JobManagementDetail';

// Tạo context để truyền token
export const TokenContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const updateUser = () => {
      const employerToken = localStorage.getItem('employer_token');
      const candidateToken = localStorage.getItem('candidate_token');
      const currentToken = employerToken || candidateToken;
      console.log('Checking token in App.js:', currentToken);
      setToken(currentToken);
      if (currentToken) {
        axios.get('http://localhost:3000/users/get-profile', {
          headers: { Authorization: `Bearer ${currentToken}` }
        }).then(response => {
          const userData = response.data;
          console.log('User data from API:', userData);
          setUser(userData);
        }).catch(error => {
          console.error('Profile error:', error.response?.status, error.response?.data || error.message);
          localStorage.removeItem('employer_token');
          localStorage.removeItem('candidate_token');
          setUser(null);
          setToken(null);
        });
      } else {
        console.log('No token found');
        setUser(null);
        setToken(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);

    return () => window.removeEventListener('storage', updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('employer_token');
    localStorage.removeItem('candidate_token');
    setUser(null);
    setToken(null);
    window.location.href = '/home';
  };

  return (
    <TokenContext.Provider value={token}>
      <div className="app">
        <Header user={user} handleLogout={handleLogout} setShowChangePassword={setShowChangePassword} />
        <Navbar user={user} />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post-job" element={user?.role === 'employer' ? <PostJob /> : <Home />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/job-detail/:id" element={<JobDetail />} />
            <Route path="/apply-job/:id" element={<ApplyJob />} />
            <Route path="/manage-posts" element={user?.role === 'employer' ? <ManageJobs /> : <Home />} />
            <Route path="/manage-applications" element={user ? <ManageApplications /> : <Home />} />
            <Route path="/edit-job/:id" element={user?.role === 'employer' ? <EditJob /> : <Home />} />
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/job-management-detail/:id" element={user?.role === 'employer' ? <JobManagementDetail /> : <Home />} />
            <Route path="/candidate-dashboard" element={user ? <Home /> : <Home />} />
          </Routes>
        </div>
        <ChangePassword show={showChangePassword} onHide={() => setShowChangePassword(false)} />
      </div>
    </TokenContext.Provider>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}