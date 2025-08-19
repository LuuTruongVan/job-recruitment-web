import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import LoginModal from './Login';
import RegisterModal from './Register';
import '../assets/css/Header.css';
import logo from "../assets/img/logo.png";

const Header = ({ user, handleLogout, setShowChangePassword }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
        <img
        className="logo"
        src={logo} 
        alt="Logo"
        style={{ width: '100px' }}
      />
        </div>

        {/* Hamburger button */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className={`nav-container ${menuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            {user && (user.role === 'candidate' || user.role === 'employer') && (
              <>
                {user.role === 'candidate' && (
                  <Link className="nav-link" to="/manage-applications" onClick={() => setMenuOpen(false)}>
                    Quản lý ứng tuyển
                  </Link>
                )}
                <Link className="nav-link" to="/favorites" onClick={() => setMenuOpen(false)}>
                  Yêu thích
                </Link>

                {/* Nút chat */}
            {/* Nút chat */}
<button
  className="nav-link btn btn-link"
  onClick={()=>{
    if(user) navigate("/chat");  // đổi từ currentUser → user
    else alert("Bạn cần đăng nhập để chat!");
  }}
>
  <i className="bi bi-chat-dots"></i>
  Chat
</button>



              </>
            )}
            {user && user.role === 'employer' && (
              <>
                <Link className="nav-link" to="/post-job" onClick={() => setMenuOpen(false)}>Đăng tin</Link>
                <Link className="nav-link" to="/manage-posts" onClick={() => setMenuOpen(false)}>Quản lý bài đăng</Link>
              </>
            )}

            {user ? (
              <div className="dropdown">
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
                      <button className="dropdown-item" onClick={() => { setShowProfileModal(true); setMenuOpen(false); }}>Xem hồ sơ</button>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item" onClick={() => { setShowChangePassword(true); setMenuOpen(false); }}>Đổi mật khẩu</button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogoutClick}>Đăng xuất</button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button className="nav-link btn btn-link" onClick={() => { setShowLoginModal(true); setMenuOpen(false); }}>Đăng Nhập</button>
                <button className="nav-link btn btn-link" onClick={() => { setShowRegisterModal(true); setMenuOpen(false); }}>Đăng Ký</button>
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
