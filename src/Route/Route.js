import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { getBuses } from '../services/api';
import './Routes.css';

const Routes = ({ isLoaded, loadError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [map, setMap] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tải danh sách xe bus từ API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getBuses();
        if (mounted) setBuses(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError('Không tải được dữ liệu xe');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load Google Maps 1 lần, dùng .env nếu có, fallback key bạn cung cấp

  // Bắt lỗi auth (key/referrer/billing)
  useEffect(() => {
    window.gm_authFailure = () => {
      // eslint-disable-next-line no-console
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
  
  const getSpeedClass = (speed) => (speed <= 20 ? 'low' : speed <= 50 ? 'medium' : 'high');
  const getStatusClass = (speed, isOnline) => (!isOnline ? 'offline' : speed === 0 ? 'idle' : 'online');
  const getMarkerIcon = (speed, isOnline) => {
    if (!isOnline) return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    if (speed === 0) return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  };

  const handleShowBus = (id) => {
    const bus = buses.find(r => r.id === id);
    if (bus && map && bus.latitude && bus.longitude) {
      map.panTo({ lat: Number(bus.latitude), lng: Number(bus.longitude) });
      map.setZoom(15);
      setSelectedBus(bus);
    }
  };

  // Lọc xe bus theo tracking ID hoặc biển số
  const filteredBuses = buses.filter(bus =>
    String(bus.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.bien_so_xe || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="routes-container">
      <div className="routes-main">
        <h1 className="routes-title">Tuyến đường các xe</h1>

        {loading && <div style={{padding: 12}}>Đang tải...</div>}
        {error && !loading && <div style={{color: 'red', padding: 12}}>{error}</div>}

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

        <div className="map-container" style={{marginTop: 20}}>
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
              {/* Markers xe bus từ DB */}
              {buses
                .filter(b => Number.isFinite(parseFloat(b.latitude)) && Number.isFinite(parseFloat(b.longitude)))
                .map((bus) => {
                  const speed = typeof bus.speed === 'string' ? Number(bus.speed) : (bus.speed || 0);
                  const isOnline = speed > 0 || bus.isOnline !== false;
                  return (
                    <Marker
                      key={`bus-${bus.id}`}
                      position={{ lat: Number(bus.latitude), lng: Number(bus.longitude) }}
                      icon={getMarkerIcon(speed, isOnline)}
                      title={`Xe ${bus.bien_so_xe || bus.id}`}
                      onClick={() => setSelectedBus(bus)}
                    />
                  );
                })}

              {selectedBus && (
                <InfoWindow
                  position={{ lat: Number(selectedBus.latitude), lng: Number(selectedBus.longitude) }}
                  onCloseClick={() => setSelectedBus(null)}
                >
                  <div className="infowindow-content">
                    <h3>Xe {selectedBus.bien_so_xe || selectedBus.id}</h3>
                    <p><strong>Tốc độ:</strong> {selectedBus.speed || 0} km/h</p>
                    <p><strong>Tọa độ:</strong> {Number(selectedBus.latitude).toFixed(6)}, {Number(selectedBus.longitude).toFixed(6)}</p>
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
          <span className="bus-count">{filteredBuses.length} xe</span>
        </div>

        <div className="routes-list">
          {filteredBuses.length > 0 ? (
            filteredBuses.map(bus => {
              const speed = typeof bus.speed === 'string' ? Number(bus.speed) : (bus.speed || 0);
              const isOnline = speed > 0 || bus.isOnline !== false;
              const trackingId = bus.bien_so_xe || `TRK${String(bus.id).padStart(3, '0')}`;
              
              return (
                <div key={bus.id} className="route-card">
                  <div className="route-header">
                    <span className="route-time">Thời gian đến: N/A</span>
                    <span className="route-id">XE: {String(bus.id).padStart(2, '0')}</span>
                  </div>

                  <div className="tracking-details">
                    <div className="tracking-item">
                      <span className="tracking-label">Tracking ID</span>
                      <span className="tracking-value">
                        <span className={`status-indicator ${getStatusClass(speed, isOnline)}`} />
                        {trackingId}
                      </span>
                    </div>
                    <div className="tracking-item">
                      <span className="tracking-label">Speed</span>
                      <span className={`tracking-value speed-value ${getSpeedClass(speed)}`}>
                        {speed} km/h
                      </span>
                    </div>
                    <div className="coordinates-section">
                      <div className="coordinate-item">
                        <span className="coordinate-label">📍 Latitude</span>
                        <span className="coordinate-value">{Number(bus.latitude || 0).toFixed(6)}</span>
                      </div>
                      <div className="coordinate-item">
                        <span className="coordinate-label">📍 Longitude</span>
                        <span className="coordinate-value">{Number(bus.longitude || 0).toFixed(6)}</span>
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
                      <button className="show-bus-btn" onClick={() => handleShowBus(bus.id)}>
                        <span className="btn-icon">📍</span>
                        <span className="btn-text">HIỂN THỊ XE</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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