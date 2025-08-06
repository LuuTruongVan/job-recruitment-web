import React from 'react';

import '../componentCss/Navbar.css';
import Breadcrumb from './Breadcrumb';

const Navbar = ({ user }) => {
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