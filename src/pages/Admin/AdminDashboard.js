import React, { useState } from 'react';
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

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <div className="admin-dashboard">
      <Navbar
        bg="light"
        expand="lg"
        expanded={expanded}
        className="admin-navbar"
      >
        {/* Icon toggle cho mobile */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(expanded ? false : true)}
          className="admin-toggle"
        />

        {/* Menu */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="manage-users" onClick={handleNavClick}>
              Quản lý người dùng
            </Nav.Link>
            <Nav.Link as={NavLink} to="manage-candidates" onClick={handleNavClick}>
              Quản lý ứng viên
            </Nav.Link>
            <Nav.Link as={NavLink} to="manage-employers" onClick={handleNavClick}>
              Quản lý nhà tuyển dụng
            </Nav.Link>
            <Nav.Link as={NavLink} to="manage-job-posts" onClick={handleNavClick}>
              Quản lý bài đăng
            </Nav.Link>
            <Nav.Link as={NavLink} to="manage-applications" onClick={handleNavClick}>
              Quản lý ứng tuyển
            </Nav.Link>
            <Nav.Link as={NavLink} to="manage-job-categories" onClick={handleNavClick}>
              Quản lý danh mục
            </Nav.Link>
            <Nav.Link as={NavLink} to="view-qualities" onClick={handleNavClick}>
              Xem số liệu
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

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