import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import './Routes.css';

const Routes = ({ isLoaded, loadError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [map, setMap] = useState(null);
  const [busRoutes, setBusRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load xe buýt từ DB (XeBus)
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        console.log('[Route] Fetching buses from API...');
        const res = await fetch('http://localhost:5000/buses');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        console.log('[Route] Raw bus data:', data);
        const formattedBuses = data.map((bus, idx) => ({
          id: String(bus.id).padStart(2, '0'),
          status: 'N/A',
          trackingId: bus.bien_so_xe || `TRK${String(idx + 1).padStart(3, '0')}`,
          timestamp: new Date().toISOString(),
          latitude: Number(bus.latitude) || (10.8231 + (idx * 0.01)),
          longitude: Number(bus.longitude) || (106.6297 + (idx * 0.01)),
          speed: bus.speed != null ? bus.speed : 0,
          isOnline: bus.speed != null,
          calculateDelay: () => 'N/A',
          updateLocation: () => {}
        }));
        console.log('[Route] Formatted buses:', formattedBuses);
        setBusRoutes(formattedBuses);
        setError(null);
      } catch (err) {
        console.error('Lỗi tải dữ liệu xe:', err);
        setError('Không thể tải danh sách xe');
        setBusRoutes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // Bắt lỗi auth Google Maps
  useEffect(() => {
    window.gm_authFailure = () => {
      console.error('Google Maps auth failed. Check API key, referrers, billing.');
    };
    return () => { delete window.gm_authFailure; };
  }, []);

  const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '8px' };
  const center = { lat: 10.8231, lng: 106.6297 };
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true
  };

  const filteredRoutes = busRoutes.filter(route =>
    route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSpeedClass = (speed) => (speed <= 20 ? 'low' : speed <= 50 ? 'medium' : 'high');
  const getStatusClass = (speed, isOnline) => (!isOnline ? 'offline' : speed === 0 ? 'idle' : 'online');
  const getMarkerIcon = (speed, isOnline) => {
    if (!isOnline) return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    if (speed === 0) return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  };

  const handleShowBus = (id) => {
    const bus = busRoutes.find(r => r.id === id);
    if (bus && map) {
      map.panTo({ lat: bus.latitude, lng: bus.longitude });
      map.setZoom(15);
      setSelectedBus(bus);
    }
  };

  return (
    <div className="routes-container">
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
          {loadError && (
            <div className="map-placeholder"><div className="map-text">Không tải được Google Maps</div></div>
          )}
          {!isLoaded && !loadError && (
            <div className="map-placeholder"><div className="map-text">Đang tải bản đồ...</div></div>
          )}
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              options={mapOptions}
              onLoad={(m) => {
                setMap(m);
                if (window.google?.maps) {
                  setTimeout(() => {
                    window.google.maps.event.trigger(m, 'resize');
                    m.setCenter(center);
                  }, 0);
                }
              }}
              onUnmount={() => setMap(null)}
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
                    <p style={{ margin: '5px 0' }}><strong>Tracking ID:</strong> {selectedBus.trackingId}</p>
                    <p style={{ margin: '5px 0' }}><strong>Tốc độ:</strong> {selectedBus.speed} km/h</p>
                    <p style={{ margin: '5px 0' }}><strong>Trạng thái:</strong> {selectedBus.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
                    <p style={{ margin: '5px 0', fontSize: 12 }}>
                      <strong>Vị trí:</strong> {selectedBus.latitude.toFixed(6)}, {selectedBus.longitude.toFixed(6)}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </div>

      <div className="routes-sidebar">
        <div className="sidebar-header">
          <h3>Danh sách xe buýt</h3>
          <span className="bus-count">{filteredRoutes.length} xe</span>
        </div>

        <div className="routes-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải danh sách xe...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p style={{ color: 'red' }}>{error}</p>
            </div>
          ) : filteredRoutes.length > 0 ? (
            filteredRoutes.map(route => (
              <div key={route.id} className="route-card">
                <div className="route-header">
                  <span className="route-time">Thời gian đến: {route.status}</span>
                  <span className="route-id">XE: {route.id}</span>
                </div>

                <div className="tracking-details">
                  <div className="tracking-item">
                    <span className="tracking-label">ID</span>
                    <span className="tracking-value">
                      <span className={`status-indicator ${getStatusClass(route.speed, route.isOnline)}`} />
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
                    <button className="show-bus-btn" onClick={() => handleShowBus(route.id)}>
                      <span className="btn-icon">📍</span>
                      <span className="btn-text">HIỂN THỊ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <p>Không tìm thấy kết quả</p>
              <small>Thử từ khóa khác</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Routes;