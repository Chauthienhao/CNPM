import React, { useState } from 'react';
import './Header.css';
import LoginModal from '../components/Authentication/LoginModal';
import SignupModal from '../components/Authentication/SignupModal';
//import { NavLink } from 'react-router-dom';

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const openSignupModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };
  const openLoginModal = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };
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
          <div className="avatar-circle" onClick={() => setIsLoginModalOpen(true)}>👤</div>
        </div>
      </div>
      {isLoginModalOpen && (
        <div className="modal-backdrop">
          <LoginModal onClose={() => setIsLoginModalOpen(false)} onOpenSignup={openSignupModal} />
        </div>
      )}
      {isSignupModalOpen && (
        <div className="modal-backdrop">
          <SignupModal onClose={() => setIsSignupModalOpen(false)} onOpenLogin={openLoginModal} />
        </div>
      )}
    </div>
  );
};

export default Header;