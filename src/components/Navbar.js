import React from 'react';
import '../componentCss/Navbar.css';
import Breadcrumb from './Breadcrumb';

const Navbar = ({ user }) => {
  // Nếu là admin thì không hiển thị Navbar
  if (user?.role === 'admin') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container-fluid">
        <div className="breadcrumb-wrapper">
          <Breadcrumb />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
