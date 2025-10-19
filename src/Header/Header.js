import React from 'react';
import './Header.css';
import logoIcon from '../Develop/logo.png';

const Header = () => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric', 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">
          <img src={logoIcon} alt="SSB Logo" className="logo-img" />
        </div>
        <div className="header-info">
          <h1 className="app-title">SSB 1.0</h1>
          <p className="app-subtitle">Smart School Bus Tracking System</p>
        </div>
      </div>
      
      <div className="header-right">
        <div className="datetime">
          {getCurrentDateTime()}
        </div>
        <div className="user-avatar">
          <div className="avatar-circle">👤</div>
        </div>
      </div>
    </div>
  );
};

export default Header;