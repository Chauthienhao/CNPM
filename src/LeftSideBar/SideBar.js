import React from 'react';
import './SideBar.css';

const Sidebar = ({ activeMenu = 'route', onMenuClick }) => {
  const menuItems = [
    { id: 'dashboard', icon: '', label: 'Dashboard' },
    { id: 'schedule', icon: '', label: 'Lịch trình' },
    { id: 'driver', icon: '', label: 'Tài xế' },
    { id: 'student', icon: '', label: 'Học sinh' },
    { id: 'route', icon: '', label: 'Tuyến đường' },
    { id: 'notification', icon: '', label: 'Thông báo' }
  ];

  const handleClick = (menuId) => {
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  return (
    <div className="menu-sidebar">
      <div className="menu-buttons">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`menu-btn ${item.id} ${activeMenu === item.id ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;