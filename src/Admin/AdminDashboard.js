import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import ManageCandidates from './ManageCandidates';
import ManageEmployers from './ManageEmployers';
import ManageJobPosts from './ManageJobPosts';
import ManageJobCategories from './ManageJobCategories';
import ManageApplications from './ManageApplications';
import ViewQualities from './ViewQualities';
import ManageUsers from './ManageUsers'; // Thêm import ManageUsers
import '../componentCss/Admin.css';
const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <Navbar bg="light" expand="lg">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          <Nav.Link as={NavLink} to="manage-users">Quản lý người dùng</Nav.Link> {/* Thêm mục này */}
            <Nav.Link as={NavLink} to="manage-candidates">Quản lý ứng viên</Nav.Link>
            <Nav.Link as={NavLink} to="manage-employers">Quản lý nhà tuyển dụng</Nav.Link>
            <Nav.Link as={NavLink} to="manage-job-posts">Quản lý bài đăng</Nav.Link>
            <Nav.Link as={NavLink} to="manage-applications">Quản lý ứng tuyển</Nav.Link>
            <Nav.Link as={NavLink} to="manage-job-categories">Quản lý danh mục</Nav.Link>
            <Nav.Link as={NavLink} to="view-qualities">Xem số liệu</Nav.Link>
       
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
          <Route path="manage-users" element={<ManageUsers />} /> {/* Thêm Route này */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;