import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import ManageApplications from './pages/ManageApplications';
import Home from './pages/Home';
import axios from 'axios';
import UpdateProfile from './pages/UpdateProfile';
import JobDetail from './pages/JobDetail';
import ApplyJob from './pages/ApplyJob';
import ManageJobs from './pages/ManageJobs';
import EditJob from './pages/EditJob';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Header from './pages/Header';
import Navbar from './pages/Navbar';
import Favorites from './pages/Favorites';
import JobManagementDetail from './pages/JobManagementDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Footer from './pages/Footer';
import ChatPage from "./pages/ChatPage";

// Tạo context để truyền token
export const TokenContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateUser = async () => {
      const adminToken = localStorage.getItem('admin_token');
      const employerToken = localStorage.getItem('employer_token');
      const candidateToken = localStorage.getItem('candidate_token');
      let currentToken = null;

      if (candidateToken) currentToken = candidateToken;
      else if (employerToken) currentToken = employerToken;
      else if (adminToken) currentToken = adminToken;

      console.log('Checking token in App.js:', { currentToken, adminToken, employerToken, candidateToken });
      setToken(currentToken);
      if (currentToken) {
        try {
          const response = await axios.get('http://localhost:3001/users/get-profile', {
            headers: { Authorization: `Bearer ${currentToken}` }
          });
          const userData = response.data;
          console.log('User data from API:', userData);
          setUser(userData);
          if (userData.role === 'admin' && window.location.pathname !== '/admin') {
            window.location.href = '/admin';
          }
        } catch (error) {
          console.error('Profile error:', {
            status: error.response?.status,
            data: error.response?.data || error.message,
            token: currentToken
          });
          localStorage.removeItem('admin_token');
          localStorage.removeItem('employer_token');
          localStorage.removeItem('candidate_token');
          setUser(null);
          setToken(null);
        }
      } else {
        console.log('No token found');
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    updateUser();
    window.addEventListener('storage', updateUser);

    return () => window.removeEventListener('storage', updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('employer_token');
    localStorage.removeItem('candidate_token');
    setUser(null);
    setToken(null);
    window.location.href = '/home';
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

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
            <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard /> : <Home />} />

            <Route path="/chat" element={user ? <ChatPage user={user} /> : <Login />} />
            <Route path="/chat/:conversationId" element={user ? <ChatPage user={user} /> : <Login />} />



</Routes>
        </div>
        <ChangePassword show={showChangePassword} onHide={() => setShowChangePassword(false)} />
      </div>
      <Footer />
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
