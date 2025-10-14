import React, { useState } from 'react';
import './Routes.css';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const busRoutes = [
    { id: '01', status: '33 phút' },
    { id: '02', status: 'N/A' },
    { id: '03', status: 'N/A' },
    { id: '04', status: '15 phút' },
    { id: '05', status: '8 phút' },
    { id: '06', status: 'N/A' },
    { id: '07', status: '22 phút' },
    { id: '08', status: '5 phút' },
    { id: '09', status: 'N/A' },
    { id: '10', status: '12 phút' },
    { id: '11', status: '30 phút' },
    { id: '12', status: 'N/A' }
  ];

  const filteredRoutes = busRoutes.filter(
    r =>
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowBus = (id) => {
    console.log('Hiển thị xe:', id);
  };

  return (
    <div className="routes-container">
      <div className="routes-main">
        <h1 className="routes-title">Tuyến đường các xe</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-text">Bản đồ tuyến đường</div>
          </div>
        </div>
      </div>

      <div className="routes-sidebar">
        <div className="routes-list">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="route-card">
              <div className="route-header">
                <span className="route-time">Thời gian đến: {route.status}</span>
                <span className="route-id">XE: {route.id}</span>
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
  );
};

export default Routes;