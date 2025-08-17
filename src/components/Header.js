import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import LoginModal from './Login';
import RegisterModal from './Register';
import '../componentCss/Header.css';

const Header = ({ user, handleLogout, setShowChangePassword }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogoutClick = () => {
    handleLogout();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img
            className="logo"
            src="/assets/img/logo.png"
            alt="Logo"
            style={{ width: '100px' }}
          />
        </div>

        <div className="nav-container">
          <div className="nav-links">
          {user && (user.role === 'candidate' || user.role === 'employer') && (
  <>
    {user.role === 'candidate' && (
      <Link className="nav-link" to="/manage-applications">Quản lý ứng tuyển</Link>
    )}
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
              <div className="dropdown" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Avatar nếu có */}
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}

                {/* Nút dropdown */}
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
                    <li>
                      <button className="dropdown-item" onClick={() => setShowProfileModal(true)}>Xem hồ sơ</button>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item" onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogoutClick}>Đăng xuất</button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button className="nav-link btn btn-link" onClick={() => setShowLoginModal(true)}>Đăng Nhập</button>
                <button className="nav-link btn btn-link" onClick={() => setShowRegisterModal(true)}>Đăng Ký</button>
              </>
            )}
          </div>
        </div>
      </div>

      <ProfileModal show={showProfileModal} onHide={() => setShowProfileModal(false)} />
      <LoginModal
  show={showLoginModal}
  onHide={() => setShowLoginModal(false)}
  onSwitch={() => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  }}
/>

<RegisterModal
  show={showRegisterModal}
  onHide={() => setShowRegisterModal(false)}
  onSwitch={() => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  }}
/>

    </header>
  );
};

export default Header;