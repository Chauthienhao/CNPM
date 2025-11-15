import React from 'react';
import './SideBar.css';

import dashboardIcon from '../Develop/dashboard.png';
import driverIcon from '../Develop/driver.png';
import routeIcon from '../Develop/route.png';
import studentIcon from '../Develop/student.png';
import scheduleIcon from '../Develop/schedule.png';
import notificationIcon from '../Develop/notification.png';

const SideBar = ({ activeMenu, onMenuClick, allowedMenuIds = null }) => {
  const allMenuItems = [
    { id: 'dashboard', icon: dashboardIcon, label: 'Dashboard' },
    { id: 'route', icon: routeIcon, label: 'Tuyến đường' },
    { id: 'driver', icon: driverIcon, label: 'Tài xế' },
    { id: 'student', icon: studentIcon, label: 'Học sinh' },
    { id: 'schedule', icon: scheduleIcon, label: 'Lịch trình' },
    { id: 'notification', icon: notificationIcon, label: 'Thông báo' }
  ];

  // Lọc menu theo allowedMenuIds (nếu null thì hiện tất cả)
  const menuItems = Array.isArray(allowedMenuIds)
    ? allMenuItems.filter(item => allowedMenuIds.includes(item.id))
    : allMenuItems;

  return (
    <div className="menu-sidebar">
      <div className="menu-buttons">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-btn ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuClick(item.id)}
          >
            <img src={item.icon} alt="" className="menu-icon-img" />
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideBar;