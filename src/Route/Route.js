import { useRef } from 'react';
import React, { useEffect, useState } from 'react';
import './Routes.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Patch lại hàm _clearLines để tránh lỗi khi this._map bị null
if (L.Routing && L.Routing.Control && L.Routing.Control.prototype._clearLines) {
    const origClearLines = L.Routing.Control.prototype._clearLines;
    L.Routing.Control.prototype._clearLines = function () {
        if (this._map && this._line) {
            this._map.removeLayer(this._line);
        }
        if (this._alternatives && this._alternatives.length) {
            for (var i in this._alternatives) {
                if (this._map && this._alternatives[i]) {
                    this._map.removeLayer(this._alternatives[i]);
                }
            }
            this._alternatives = [];
        }
        // Nếu cần giữ lại các xử lý khác, gọi hàm gốc
        if (origClearLines) {
            try { origClearLines.call(this); } catch (e) {}
        }
    };
}
// Component Routing sử dụng leaflet-routing-machine
function Routing({ stops }) {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        // Cleanup old routing control if exists
        if (routingControlRef.current) {
            try {
                if (routingControlRef.current._map) {
                    routingControlRef.current._map.removeControl(routingControlRef.current);
                }
            } catch (e) {
                // ignore leaflet internal errors
            }
            routingControlRef.current = null;
        }

        if (!map || stops.length < 2) return;

        const waypoints = stops.map(stop => L.latLng(Number(stop.latitude), Number(stop.longitude)));
        const routingControl = L.Routing.control({
            waypoints,
            lineOptions: {
                styles: [{ color: '#007bff', weight: 4, opacity: 0.8 }]
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            show: false
        }).addTo(map);

        routingControlRef.current = routingControl;

        return () => {
            if (routingControlRef.current) {
                try {
                    if (routingControlRef.current._map) {
                        routingControlRef.current._map.removeControl(routingControlRef.current);
                    }
                } catch (e) {
                    // ignore leaflet internal errors
                }
                routingControlRef.current = null;
            }
        };
    }, [map, stops]);

    return null;
}

// Custom marker icons giống Google Maps
const greenIcon = new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
const redIcon = new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
const yellowIcon = new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
const blueIcon = new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// #region Component chính: Routes
// Props: isLoaded (Google Maps đã load), loadError (lỗi khi load Maps)
// #endregion
const Routes = ({ isLoaded, loadError }) => {
    // #region State chính
    // const [directions, setDirections] = useState({}); // Sẽ chuyển sang logic của Leaflet
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm xe
    const [selectedBus, setSelectedBus] = useState(null); // Xe đang được chọn để hiển thị InfoWindow
    const [selectedRouteId, setSelectedRouteId] = useState(null); // Tuyến đang được routing
    const [busRoutes, setBusRoutes] = useState([]); // Danh sách xe buýt
    const [routeStops, setRouteStops] = useState({}); // Lưu các điểm dừng của từng tuyến
    const [loading, setLoading] = useState(true); // Trạng thái loading
    const [error, setError] = useState(null); // Lưu lỗi
    const markerRefs = useRef({});
    // ...existing code...

    // #region useEffect - Fetch dữ liệu
    // Load xe buýt từ DB (XeBus)
    useEffect(() => {
      // Fetch danh sách xe buýt từ API backend
      const fetchBuses = async () => {
        try {
          if (loading) setLoading(false);
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
            tuyen_duong_id: bus.tuyen_duong_id,
            calculateDelay: () => 'N/A',
            updateLocation: () => {}
          }));
          console.log('[Route] Formatted buses:', formattedBuses);
          setBusRoutes(formattedBuses);
          // Fetch stops từ API routes
          const routesRes = await fetch('http://localhost:5000/routes');
          if (routesRes.ok) {
            const routesData = await routesRes.json();
            const stopsData = {};
            for (const route of routesData) {
              const stopsRes = await fetch(`http://localhost:5000/routes/${route.id}/stops`);
              if (stopsRes.ok) {
                stopsData[route.id] = await stopsRes.json();
              }
            }
            setRouteStops(stopsData);
          }
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
    }, [isLoaded, loading]);
    // #endregion

    // #region Xử lý Google Maps
    // Bắt lỗi auth Google Maps
    useEffect(() => {
        window.gm_authFailure = () => {
            console.error('Google Maps auth failed. Check API key, referrers, billing.');
        };
        return () => { delete window.gm_authFailure; };
    }, []);

    // Style bản đồ Google Maps
    const mapContainerStyle = { width: '100%', height: '650px', borderRadius: '8px' };
    // #endregion

        // #region useEffect DirectionsRenderer
        // Đã loại bỏ logic Google Directions API, sẽ chuyển sang Leaflet
        // #endregion
        // #endregion

    // #region Tọa độ & options bản đồ
    const center = [10.8231, 106.6297];
    // #endregion

    // #region Hàm phụ trợ
    // Lấy thời gian đến dự kiến từ Directions API
    function getEtaFromDirections(directions) {
      if (!directions || !directions.routes || !directions.routes[0] || !directions.routes[0].legs) return 'N/A';
      const legs = directions.routes[0].legs;
      let totalDuration = 0;
      legs.forEach(leg => {
        if (leg.duration && leg.duration.value) {
          totalDuration += leg.duration.value; // giây
        }
      });
      if (totalDuration > 0) {
        const minutes = Math.round(totalDuration / 60);
        return `${minutes} phút`;
      }
      return 'N/A';
    }
    const filteredRoutes = busRoutes.filter(route =>
        route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hàm xác định class tốc độ/trạng thái xe
    const getSpeedClass = (speed) => (speed <= 20 ? 'low' : speed <= 50 ? 'medium' : 'high');
    const getStatusClass = (speed, isOnline) => (!isOnline ? 'offline' : speed === 0 ? 'idle' : 'online');
    const getMarkerIcon = (speed, isOnline) => {
        if (!isOnline) return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        if (speed === 0) return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    };

    const handleShowBus = (id) => {
        const bus = busRoutes.find(r => r.id === id);
        if (bus) {
            setSelectedBus(bus); // Mở popup tại marker xe buýt
            // Chỉ cập nhật selectedRouteId nếu tuyến có đủ điểm dừng
            const stops = routeStops[bus.tuyen_duong_id] || [];
            if (stops.length >= 2) {
                setSelectedRouteId(bus.tuyen_duong_id);
            } else {
                setSelectedRouteId(null);
            }
            // Mở popup bằng ref nếu marker đã render
            setTimeout(() => {
                if (markerRefs.current[bus.id]) {
                    markerRefs.current[bus.id].openPopup();
                }
            }, 100);
        }
    };
    // #endregion

    // #region Render UI
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
                    <MapContainer center={center} zoom={13} style={{ width: '100%', height: '650px', borderRadius: '8px' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank' rel='noopener noreferrer'>OpenStreetMap</a> contributors"
                        />
                        {/* Hiển thị tất cả các tuyến đường bằng Polyline và Routing */}
                        {Object.entries(routeStops).map(([routeId, stops]) => (
                            stops.length >= 2 ? (
                                <>
                                    <Polyline
                                        key={`polyline-${routeId}`}
                                        positions={stops.map(stop => [Number(stop.latitude), Number(stop.longitude)])}
                                        pathOptions={{ color: '#888', weight: 3, opacity: 0.6, dashArray: '6' }}
                                    />
                                    <Routing key={`routing-${routeId}`} stops={stops} />
                                </>
                            ) : null
                        ))}

                        {busRoutes.map((bus) => (
                            <Marker
                                key={bus.id}
                                position={[bus.latitude, bus.longitude]}
                                icon={
                                    !bus.isOnline ? redIcon :
                                    bus.speed === 0 ? yellowIcon :
                                    greenIcon
                                }
                                eventHandlers={{ click: () => {
                                    handleShowBus(bus.id);
                                    setSelectedRouteId(bus.tuyen_duong_id);
                                } }}
                                ref={(ref) => { markerRefs.current[bus.id] = ref; }}
                            >
                                {selectedBus && selectedBus.id === bus.id && (
                                    <Popup position={[bus.latitude, bus.longitude]} onClose={() => setSelectedBus(null)}>
                                        <div style={{ padding: '10px', minWidth: '200px' }}>
                                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Xe {bus.id}</h3>
                                            <p style={{ margin: '5px 0' }}><strong>Biển số xe:</strong> {bus.trackingId}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Tốc độ:</strong> {bus.speed} km/h</p>
                                            <p style={{ margin: '5px 0' }}><strong>Trạng thái:</strong> {bus.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
                                            <p style={{ margin: '5px 0', fontSize: 12 }}>
                                                <strong>Vĩ độ:</strong> {bus.latitude.toFixed(6)}<br/>
                                                <strong>Kinh độ:</strong> {bus.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </Popup>
                                )}
                            </Marker>
                        ))}
                        {busRoutes.map((bus) => {
                            const stops = routeStops[bus.tuyen_duong_id] || [];
                            const markers = [];
                            if (stops.length >= 2) {
                                const firstStop = stops[0];
                                const lastStop = stops[stops.length - 1];
                                markers.push(
                                    <Marker
                                        key={`pickup-${bus.id}`}
                                        position={[Number(firstStop.latitude), Number(firstStop.longitude)]}
                                        icon={greenIcon}
                                    >
                                        <Popup>
                                            <span>Điểm đón: {firstStop.ten_diem_dung}</span>
                                        </Popup>
                                    </Marker>
                                );
                                markers.push(
                                    <Marker
                                        key={`dropoff-${bus.id}`}
                                        position={[Number(lastStop.latitude), Number(lastStop.longitude)]}
                                        icon={redIcon}
                                    >
                                        <Popup>
                                            <span>Điểm đến: {lastStop.ten_diem_dung}</span>
                                        </Popup>
                                    </Marker>
                                );
                                stops.slice(1, stops.length - 1).forEach((stop, index) => {
                                    markers.push(
                                        <Marker
                                            key={`midstop-${bus.id}-${index}`}
                                            position={[Number(stop.latitude), Number(stop.longitude)]}
                                            icon={blueIcon}
                                        >
                                            <Popup>
                                                <span>Điểm dừng: {stop.ten_diem_dung}</span>
                                            </Popup>
                                        </Marker>
                                    );
                                });
                            }
                            return markers;
                        })}
                    </MapContainer>
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
                        filteredRoutes.map(route => {
                            const stops = routeStops[route.tuyen_duong_id] || [];
                            const firstStop = stops[0];
                            const lastStop = stops[stops.length - 1];
                            return (
                                <div key={route.id} className="route-card">
                                    <div className="route-header">
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
                                            <span className={`tracking-value speed-value ${getSpeedClass(route.speed)}`}>{route.speed} km/h</span>
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
                                                <div className="point-indicator departure" />
                                                <span className="point-label">{firstStop?.ten_diem_dung || 'Chưa thiết lập điểm đón'}</span>
                                            </div>
                                            <div className="route-point">
                                                <div className="point-indicator arrival" />
                                                <span className="point-label">{lastStop?.ten_diem_dung || 'Chưa thiết lập điểm đến'}</span>
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
}
export default Routes;