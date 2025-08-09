import React from 'react';
import { Link } from 'react-router-dom';
import '../componentCss/Header.css';

const Header = ({ user, handleLogout, setShowChangePassword }) => {
  const handleLogoutClick = () => {
    handleLogout(); // Gọi hàm logout từ prop
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img className="logo" src="/assets/img/logo.jpg" alt="Logo" style={{ width: '100px' }} />
        </div>
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
      <li><Link className="dropdown-item" to="/profile">Xem hồ sơ</Link></li>
      <li><Link className="dropdown-item" to="/update-profile">Cập nhật thông tin</Link></li>
    </>
  )}
  <li><button className="dropdown-item" onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</button></li>
  <li><button className="dropdown-item" onClick={handleLogoutClick}>Đăng xuất</button></li>
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
    </header>
  );
};

export default Header;