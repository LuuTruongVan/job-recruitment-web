import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Đặc biệt cho trang home, chỉ hiển thị "Trang chủ"
  if (location.pathname === '/home') {
    return (
      <nav className="breadcrumb-nav">
        <div className="container-fluid">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Trang chủ
            </li>
          </ol>
        </div>
      </nav>
    );
  }

  return (
    <nav className="breadcrumb-nav">
      <div className="container-fluid">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            // Loại bỏ ID (giả định ID là số)
            const isId = !isNaN(value) || value.match(/^\d+$/);
            if (isId && isLast) return null; // Bỏ ID ở cuối
            const displayName = isId ? (isLast ? 'Chi tiết' : 'Job') : value
              .replace('-', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            return isLast ? (
              <li key={to} className="breadcrumb-item">
                <Link to={location.pathname}>{displayName === 'Apply Job' ? 'Ứng tuyển' : displayName}</Link>
              </li>
            ) : (
              <li key={to} className="breadcrumb-item">
                <Link to={to}>{displayName === 'Apply Job' ? 'Ứng tuyển' : displayName}</Link>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;