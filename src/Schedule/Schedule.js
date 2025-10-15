import React, { useState } from 'react';
import Header from '../Header/Header';
import Sidebar from '../LeftSideBar/SideBar';
import './Schedule.css';

const Schedule = () => {
  const [selectedTab, setSelectedTab] = useState('routes');
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [routeName, setRouteName] = useState(''); // Từ Google Maps API
  const [driverId, setDriverId] = useState('');
  const [busId, setBusId] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    console.log('Menu clicked:', menuId);
  };

  const handleSave = () => {
    console.log({
      routeName,
      driverId,
      busId,
      studentId
    });
    alert('Đã lưu thông tin!');
  };

  const handleCancel = () => {
    setRouteName('');
    setDriverId('');
    setBusId('');
    setStudentId('');
  };

  // Mock data - thay bằng data từ Google Maps API
  const scheduleData = {
    'Thứ 2': [
      { route: 'tuyến 01', time: '9:30 AM' },
      { route: 'tuyến 02', time: '1:00 PM' },
      { route: 'tuyến 03', time: '3:30 PM' }
    ],
    'Thứ 3': [
      { route: 'tuyến 01', time: '7:30 AM' },
      { route: 'tuyến 02', time: '8:30 AM' },
      { route: 'tuyến 03', time: '3:30 PM' },
      { route: 'tuyến 04', time: '5:30 PM' }
    ],
    'Thứ 4': [
      { route: 'tuyến 01', time: '7:30 AM' },
      { route: 'tuyến 02', time: '8:30 AM' }
    ],
    'Thứ 5': [
      { route: 'tuyến 01', time: '7:30 AM' }
    ],
    'Thứ 6': [],
    'Thứ 7': [
      { route: 'tuyến 01', time: '8:30 AM' }
    ]
  };

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <div className="app-wrapper">
      <Header />
      
      <div className="page-body">
        <Sidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        
        <div className="schedule-container">
          <div className="schedule-main">
            <h2 className="schedule-title">Quản lí lịch trình</h2>
            
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${selectedTab === 'routes' ? 'active' : ''}`}
                onClick={() => setSelectedTab('routes')}
              >
                Tất cả tuyến đường
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setSelectedTab('monthly')}
              >
                Hàng tháng
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'bus' ? 'active' : ''}`}
                onClick={() => setSelectedTab('bus')}
              >
                Tất cả xe buýt
              </button>
            </div>

            <div className="schedule-grid">
              <div className="day-headers">
                {days.map(day => (
                  <div key={day} className="day-header">{day}</div>
                ))}
              </div>
              
              <div className="schedule-content">
                {days.map(day => (
                  <div key={day} className="day-column">
                    {scheduleData[day].map((item, index) => (
                      <div key={index} className="schedule-item">
                        <div className="route-name">{item.route}</div>
                        <div className="route-time">{item.time}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="schedule-sidebar">
            <div className="sidebar-section">
              <h3>Chi tiết:</h3>
              
              <label>Tên tuyến đường</label>
              {/* READ-ONLY - chỉ hiển thị từ Google Maps API */}
              <div className="readonly-field">
                {routeName || 'Chọn tuyến từ bản đồ'}
              </div>
              
              <label>Tài xế:</label>
              <select 
                className="dropdown"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                <option value="">Chọn tài xế</option>
                <option value="driver1">Nguyễn Văn A</option>
                <option value="driver2">Trần Thị B</option>
                <option value="driver3">Lê Văn C</option>
              </select>
              
              <label>Xe buýt:</label>
              <select 
                className="dropdown"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
              >
                <option value="">Chọn xe buýt</option>
                <option value="bus1">XE 01</option>
                <option value="bus2">XE 02</option>
                <option value="bus3">XE 03</option>
              </select>
              
              <label>Danh sách học sinh:</label>
              <select 
                className="dropdown"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Chọn học sinh</option>
                <option value="student1">Học sinh 01</option>
                <option value="student2">Học sinh 02</option>
                <option value="student3">Học sinh 03</option>
              </select>
            </div>
            
            <div className="sidebar-buttons">
              <button className="btn-cancel" onClick={handleCancel}>Hủy</button>
              <button className="btn-save" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;