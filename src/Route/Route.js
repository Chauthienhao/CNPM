import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import './Routes.css';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const busRoutes = [
    { 
      id: '01', 
      status: 'N/A',
      trackingId: 'TRK001',
      timestamp: new Date().toISOString(),
      latitude: 10.8231,
      longitude: 106.6297,
      speed: 25,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '02', 
      status: 'N/A',
      trackingId: 'TRK002',
      timestamp: new Date().toISOString(),
      latitude: 10.8331,
      longitude: 106.6397,
      speed: 0,
      isOnline: false,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '03', 
      status: 'N/A',
      trackingId: 'TRK003',
      timestamp: new Date().toISOString(),
      latitude: 10.8131,
      longitude: 106.6197,
      speed: 45,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '04', 
      status: 'N/A',
      trackingId: 'TRK004',
      timestamp: new Date().toISOString(),
      latitude: 10.8431,
      longitude: 106.6497,
      speed: 15,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '05', 
      status: 'N/A',
      trackingId: 'TRK005',
      timestamp: new Date().toISOString(),
      latitude: 10.8031,
      longitude: 106.6097,
      speed: 60,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '06', 
      status: 'N/A',
      trackingId: 'TRK006',
      timestamp: new Date().toISOString(),
      latitude: 10.8531,
      longitude: 106.6597,
      speed: 0,
      isOnline: false,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '07', 
      status: 'N/A',
      trackingId: 'TRK007',
      timestamp: new Date().toISOString(),
      latitude: 10.7931,
      longitude: 106.5997,
      speed: 35,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '08', 
      status: 'N/A',
      trackingId: 'TRK008',
      timestamp: new Date().toISOString(),
      latitude: 10.8631,
      longitude: 106.6697,
      speed: 20,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '09', 
      status: 'N/A',
      trackingId: 'TRK009',
      timestamp: new Date().toISOString(),
      latitude: 10.7831,
      longitude: 106.5897,
      speed: 0,
      isOnline: false,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '10', 
      status: 'N/A',
      trackingId: 'TRK010',
      timestamp: new Date().toISOString(),
      latitude: 10.8731,
      longitude: 106.6797,
      speed: 40,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '11', 
      status: 'N/A',
      trackingId: 'TRK011',
      timestamp: new Date().toISOString(),
      latitude: 10.7731,
      longitude: 106.5797,
      speed: 55,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    },
    { 
      id: '12', 
      status: 'N/A',
      trackingId: 'TRK012',
      timestamp: new Date().toISOString(),
      latitude: 10.8831,
      longitude: 106.6897,
      speed: 10,
      isOnline: true,
      calculateDelay: () => 'N/A',
      updateLocation: (lat, lng) => console.log(`Updated location: ${lat}, ${lng}`)
    }
  ];

  const filteredRoutes = busRoutes.filter(route =>
    route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSpeedClass = (speed) => {
    if (speed <= 20) return 'low';
    if (speed <= 50) return 'medium';
    return 'high';
  };

  const getStatusClass = (speed, isOnline) => {
    if (!isOnline) return 'offline';
    if (speed === 0) return 'idle';
    return 'online';
  };

  const onlineBuses = busRoutes.filter(route => route.isOnline).length;

  const handleShowBus = (id) => {
    const bus = busRoutes.find(route => route.id === id);
    if (bus) {
      console.log('Tracking Data:', {
        busId: bus.id,
        trackingId: bus.trackingId,
        timestamp: bus.timestamp,
        latitude: bus.latitude,
        longitude: bus.longitude,
        speed: bus.speed,
        isOnline: bus.isOnline,
        delay: bus.calculateDelay()
      });
      
      // Simulate showing bus on map
      alert(`Hiển thị xe ${bus.id} trên bản đồ\nVị trí: ${bus.latitude.toFixed(6)}, ${bus.longitude.toFixed(6)}\nTốc độ: ${bus.speed} km/h\nTrạng thái: ${bus.isOnline ? 'Online' : 'Offline'}`);
    }
  };

  const handleMenuClick = (action) => {
    console.log('Menu clicked:', action);
    switch(action) {
      case 'dashboard':
        alert('Chuyển đến Dashboard');
        break;
      case 'schedule':
        alert('Chuyển đến Lịch trình');
        break;
      case 'driver':
        alert('Chuyển đến Quản lý Tài xế');
        break;
      case 'student':
        alert('Chuyển đến Quản lý Học sinh');
        break;
      case 'notification':
        alert('Chuyển đến Thông báo');
        break;
      default:
        break;
    }
  };

  return (
    <div className="app-wrapper">
      <Header />
      <div className="routes-container">
        {/* Sidebar trái - Menu chức năng */}
        <div className="menu-sidebar">
          <div className="menu-buttons">
            <button 
              onClick={() => handleMenuClick('dashboard')} 
              className="menu-btn dashboard"
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleMenuClick('schedule')} 
              className="menu-btn schedule"
            >
              Lịch trình
            </button>
            <button 
              onClick={() => handleMenuClick('driver')} 
              className="menu-btn driver"
            >
              Tài xế
            </button>
            <button 
              onClick={() => handleMenuClick('student')} 
              className="menu-btn student"
            >
              Học sinh
            </button>
            <button 
              onClick={() => handleMenuClick('route')} 
              className="menu-btn route active"
            >
              Tuyến đường
            </button>
            <button 
              onClick={() => handleMenuClick('notification')} 
              className="menu-btn notification"
            >
              Thông báo
            </button>
          </div>
        </div>

        {/* Phần chính */}
        <div className="routes-main">
          <h1 className="routes-title">Tuyến đường các xe</h1>

          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo xe, tracking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>

          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-text">🗺️ Bản đồ tuyến đường</div>
              <div className="tracking-info">
                <p>🚌 Tracking System Ready</p>
                <p>📊 Total Buses: {busRoutes.length}</p>
                <p>🟢 Online: {onlineBuses} | 🔴 Offline: {busRoutes.length - onlineBuses}</p>
                <p>⏰ Last Update: {currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar phải - Danh sách xe */}
        <div className="routes-sidebar">
          <div className="routes-list">
            {filteredRoutes.map(route => (
              <div key={route.id} className="route-card">
                <div className="route-header">
                  <span className="route-time">Thời gian đến: {route.status}</span>
                  <span className="route-id">XE: {route.id}</span>
                </div>
                
                <div className="tracking-details">
                  <div className="tracking-item">
                    <span className="tracking-label">Tracking ID</span>
                    <span className="tracking-value">
                      <span className={`status-indicator ${getStatusClass(route.speed, route.isOnline)}`}></span>
                      {route.trackingId}
                    </span>
                  </div>
                  
                  <div className="tracking-item">
                    <span className="tracking-label">Speed</span>
                    <span className={`tracking-value speed-value ${getSpeedClass(route.speed)}`}>
                      {route.speed} km/h
                    </span>
                  </div>
                  
                  <div className="coordinates-section">
                    <div className="coordinate-item">
                      <span className="coordinate-label">Latitude</span>
                      <span className="coordinate-value">{route.latitude.toFixed(6)}</span>
                    </div>
                    <div className="coordinate-item">
                      <span className="coordinate-label">Longitude</span>
                      <span className="coordinate-value">{route.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div className="route-body">
                  <div className="route-points">
                    <div className="route-point">
                      <div className="point-indicator arrival" />
                      <span className="point-label">Điểm đến</span>
                    </div>
                    <div className="route-point">
                      <div className="point-indicator departure" />
                      <span className="point-label">Điểm đón</span>
                    </div>
                  </div>

                  <div className="route-controls">
                    <button
                      className="show-bus-btn"
                      onClick={() => handleShowBus(route.id)}
                    >
                      Hiển thị xe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routes;