import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import ManageCandidates from './ManageCandidates';
import ManageEmployers from './ManageEmployers';
import ManageJobPosts from './ManageJobPosts';
import ManageJobCategories from './ManageJobCategories';
import ManageApplications from './ManageApplications';
import ViewQualities from './ViewQualities';
import ManageUsers from './ManageUsers';
import '../../assets/css/Admin.css';

const AdminDashboard = () => {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <div className="admin-dashboard">
      <Navbar bg="light" expand="lg" className="admin-navbar">
        {/* Icon toggle cho mobile */}
        {isMobile && (
          <button
            className="admin-toggle"
            onClick={() => setExpanded(true)}
          >
            ☰
          </button>
        )}

        {/* Menu cho desktop */}
        {!isMobile && (
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="manage-users" onClick={handleNavClick}>Quản lý người dùng</Nav.Link>
            <Nav.Link as={NavLink} to="manage-candidates" onClick={handleNavClick}>Quản lý ứng viên</Nav.Link>
            <Nav.Link as={NavLink} to="manage-employers" onClick={handleNavClick}>Quản lý nhà tuyển dụng</Nav.Link>
            <Nav.Link as={NavLink} to="manage-job-posts" onClick={handleNavClick}>Quản lý bài đăng</Nav.Link>
            <Nav.Link as={NavLink} to="manage-applications" onClick={handleNavClick}>Quản lý ứng tuyển</Nav.Link>
            <Nav.Link as={NavLink} to="manage-job-categories" onClick={handleNavClick}>Quản lý danh mục</Nav.Link>
            <Nav.Link as={NavLink} to="view-qualities" onClick={handleNavClick}>Xem số liệu</Nav.Link>
          </Nav>
        )}
      </Navbar>

      {/* Modal cho mobile */}
      {isMobile && expanded && (
        <div className="mobile-menu-overlay" onClick={() => setExpanded(false)}>
          <div
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()} 
          >
            <button className="close-btn" onClick={() => setExpanded(false)}>
              ✕
            </button>
            <Nav className="mobile-nav">
              <Nav.Link as={NavLink} to="manage-users" onClick={handleNavClick}>Quản lý người dùng</Nav.Link>
              <Nav.Link as={NavLink} to="manage-candidates" onClick={handleNavClick}>Quản lý ứng viên</Nav.Link>
              <Nav.Link as={NavLink} to="manage-employers" onClick={handleNavClick}>Quản lý nhà tuyển dụng</Nav.Link>
              <Nav.Link as={NavLink} to="manage-job-posts" onClick={handleNavClick}>Quản lý bài đăng</Nav.Link>
              <Nav.Link as={NavLink} to="manage-applications" onClick={handleNavClick}>Quản lý ứng tuyển</Nav.Link>
              <Nav.Link as={NavLink} to="manage-job-categories" onClick={handleNavClick}>Quản lý danh mục</Nav.Link>
              <Nav.Link as={NavLink} to="view-qualities" onClick={handleNavClick}>Xem số liệu</Nav.Link>
            </Nav>
          </div>
        </div>
      )}

      <div className="content">
        <Routes>
          <Route path="manage-candidates" element={<ManageCandidates />} />
          <Route path="manage-employers" element={<ManageEmployers />} />
          <Route path="manage-job-posts" element={<ManageJobPosts />} />
          <Route path="manage-job-categories" element={<ManageJobCategories />} />
          <Route path="manage-applications" element={<ManageApplications />} />
          <Route path="view-qualities" element={<ViewQualities />} />
          <Route path="manage-users" element={<ManageUsers />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
