import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import '../componentCss/Header.css';

const Header = ({ user, handleLogout, setShowChangePassword }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogoutClick = () => {
    handleLogout();
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-container">
          <img
            className="logo"
            src="/assets/img/logo.jpg"
            alt="Logo"
            style={{ width: '100px' }}
          />
        </div>

        {/* Navigation */}
        <div className="nav-container">
          <div className="nav-links">
            {user && user.role === 'candidate' && (
              <>
                <Link className="nav-link" to="/manage-applications">Quản lý ứng tuyển</Link>
                <Link className="nav-link" to="/favorites">Yêu thích</Link>
              </>
            )}
            {user && user.role === 'employer' && (
              <>
                <Link className="nav-link" to="/post-job">Đăng tin</Link>
                <Link className="nav-link" to="/manage-posts">Quản lý bài đăng</Link>
              </>
            )}

            {user ? (
              <div className="dropdown">
                <button className="dropdown-toggle">
                  Xin chào, {user.role === 'candidate'
                    ? (user.full_name || 'Người dùng')
                    : user.role === 'employer'
                      ? (user.name || 'Công ty')
                      : user.role === 'admin'
                        ? (user.username || user.email || 'Quản trị viên')
                        : 'Người dùng'}
                </button>
                <ul className="dropdown-menu">
                  {user.role !== 'admin' && (
                    <>
                      {/* Mở modal thay vì đi tới trang profile */}
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setShowProfileModal(true)}
                        >
                          Xem hồ sơ
                        </button>
                      </li>
                    </>
                  )}
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setShowChangePassword(true)}
                    >
                      Đổi mật khẩu
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogoutClick}
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link className="nav-link" to="/login">Đăng Nhập</Link>
                <Link className="nav-link" to="/register">Đăng Ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal hiển thị hồ sơ */}
      <ProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
      />
    </header>
  );
};

export default Header;
