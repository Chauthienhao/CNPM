import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Header from '../Header/Header';
import Sidebar from '../LeftSideBar/SideBar';
import './Routes.css';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState('route');
  const [selectedBus, setSelectedBus] = useState(null);
  const [map, setMap] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px'
  };

  // Trung tâm TP.HCM
  const center = {
    lat: 10.8231,
    lng: 106.6297
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
  };

  // Update time every second
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

  const getMarkerIcon = (speed, isOnline) => {
    if (!isOnline) {
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
    if (speed === 0) {
      return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    }
    return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  };

  const onlineBuses = busRoutes.filter(route => route.isOnline).length;
  const activeBuses = busRoutes.filter(route => route.speed > 0).length;

  const handleShowBus = (id) => {
    const bus = busRoutes.find(route => route.id === id);
    if (bus && map) {
      map.panTo({ lat: bus.latitude, lng: bus.longitude });
      map.setZoom(15);
      setSelectedBus(bus);
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    console.log('Menu clicked:', menuId);
    
    const menuActions = {
      dashboard: () => alert('Chuyển đến Dashboard'),
      schedule: () => alert('Chuyển đến Lịch trình'),
      driver: () => alert('Chuyển đến Quản lý Tài xế'),
      student: () => alert('Chuyển đến Quản lý Học sinh'),
      route: () => alert('Chuyển đến Tuyến đường'),
      notification: () => alert('Chuyển đến Thông báo')
    };

    if (menuActions[menuId]) {
      menuActions[menuId]();
    }
  };

  return (
    <div className="app-wrapper">
      <Header />
      
      <div className="routes-container">
        <Sidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

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
            <LoadScript googleMapsApiKey="AIzaSyDtViS_O_TRVKPXi43VpL-ZS3bRLeoOiVY">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={mapOptions}
                onLoad={(map) => setMap(map)}
              >
                {busRoutes.map((bus) => (
                  <Marker
                    key={bus.id}
                    position={{ lat: bus.latitude, lng: bus.longitude }}
                    icon={getMarkerIcon(bus.speed, bus.isOnline)}
                    onClick={() => setSelectedBus(bus)}
                    title={`Xe ${bus.id}`}
                  />
                ))}

                {selectedBus && (
                  <InfoWindow
                    position={{ lat: selectedBus.latitude, lng: selectedBus.longitude }}
                    onCloseClick={() => setSelectedBus(null)}
                  >
                    <div style={{ padding: '10px', minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Xe {selectedBus.id}</h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Tracking ID:</strong> {selectedBus.trackingId}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Tốc độ:</strong> {selectedBus.speed} km/h
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Trạng thái:</strong> {selectedBus.isOnline ? '🟢 Online' : '🔴 Offline'}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>
                        <strong>Vị trí:</strong> {selectedBus.latitude.toFixed(6)}, {selectedBus.longitude.toFixed(6)}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>

        <div className="routes-sidebar">
          <div className="sidebar-header">
            <h3 style={{ color: '#ffffff' }}>Danh sách xe buýt</h3>
            <span className="bus-count" style={{ color: '#ffffff'}}>{filteredRoutes.length} xe</span>
          </div>

          <div className="routes-list">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map(route => (
                <div key={route.id} className="route-card">
                  <div className="route-header">
                    <span className="route-time" style={{ color: '#ffffff' }}>Thời gian đến: {route.status}</span>
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
                        <span className="coordinate-label">📍 Latitude</span>
                        <span className="coordinate-value">{route.latitude.toFixed(6)}</span>
                      </div>
                      <div className="coordinate-item">
                        <span className="coordinate-label">📍 Longitude</span>
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
                        <span className="btn-icon">📍</span>
                        <span className="btn-text">Hiển thị</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>Không tìm thấy kết quả</p>
                <small>Thử tìm kiếm với từ khóa khác</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routes;