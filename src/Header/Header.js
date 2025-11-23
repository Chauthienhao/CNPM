import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

const Header = ({ username, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const toggleDropdown = () => {
    console.log('Toggle dropdown from', dropdownOpen, 'to', !dropdownOpen);
    setDropdownOpen(prev => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  console.log('Header username:', username);

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">
          <img src={require('../Develop/logo.png')} alt="SSB Logo" className="logo-img" />
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
        <div
          className="user-avatar"
          title="Click để xem thông tin"
          onClick={toggleDropdown}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}
        >
          <div className="avatar-circle" style={{ marginRight: '6px' }}>👤</div>
          <span className="username-text">{username}</span>

          {dropdownOpen && (
            <div
              className="dropdown-menu custom-dropdown-menu"
              ref={dropdownRef}
            >
              <button
                className="logout-button"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
