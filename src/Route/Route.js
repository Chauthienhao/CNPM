// #region Tổng quan file Route.js
// Chức năng: Hiển thị bản đồ Google Maps, các tuyến xe buýt, marker vị trí xe, điểm đón/điểm đến, vẽ đường đi thực tế bằng Directions API
// Marker màu xanh lá: Điểm đón (đầu tuyến)
// Marker màu đỏ: Điểm đến (cuối tuyến)
// Marker màu vàng/xanh lá/đỏ: Vị trí hiện tại của xe buýt (tùy trạng thái)
// Đường đi thực tế: vẽ bằng DirectionsRenderer (Google Directions API)
// #endregion

import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import './Routes.css';

// #region Component chính: Routes
// Props: isLoaded (Google Maps đã load), loadError (lỗi khi load Maps)
// #endregion
const Routes = ({ isLoaded, loadError }) => {
    // #region State chính
    const [directions, setDirections] = useState({}); // Lưu dữ liệu route thực tế cho từng xe
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm xe
    const [selectedBus, setSelectedBus] = useState(null); // Xe đang được chọn để hiển thị InfoWindow
    const [map, setMap] = useState(null); // Đối tượng Google Map
    const [busRoutes, setBusRoutes] = useState([]); // Danh sách xe buýt
    const [routeStops, setRouteStops] = useState({}); // Lưu các điểm dừng của từng tuyến
    const [loading, setLoading] = useState(true); // Trạng thái loading
    const [error, setError] = useState(null); // Lưu lỗi
    // #endregion

    // #region useEffect - Fetch dữ liệu
    // Load xe buýt từ DB (XeBus)
    useEffect(() => {
        // Fetch directions for each route
        const fetchDirections = async () => {
            if (!window.google || !window.google.maps) return;
            const directionsService = new window.google.maps.DirectionsService();
            const newDirections = {};
            for (const bus of busRoutes) {
                const stops = routeStops[bus.tuyen_duong_id] || [];
                if (stops.length < 2) continue;
                const waypoints = stops.slice(1, stops.length - 1).map(stop => ({
                    location: { lat: Number(stop.latitude), lng: Number(stop.longitude) },
                    stopover: true
                }));
                const origin = { lat: Number(stops[0].latitude), lng: Number(stops[0].longitude) };
                const destination = { lat: Number(stops[stops.length - 1].latitude), lng: Number(stops[stops.length - 1].longitude) };
                await new Promise((resolve) => {
                    directionsService.route({
                        origin,
                        destination,
                        waypoints,
                        travelMode: window.google.maps.TravelMode.DRIVING
                    }, (result, status) => {
                        if (status === 'OK') {
                            newDirections[bus.id] = result;
                        }
                        resolve();
                    });
                });
            }
            setDirections(newDirections);
        };
        if (isLoaded) {
            fetchDirections();
        }
        // Fetch danh sách xe buýt từ API backend
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
    }, []);
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
    useEffect(() => {
        if (!isLoaded) return;
        if (!window.google || !window.google.maps) return;
        if (!Object.keys(routeStops).length) return;
        const directionsService = new window.google.maps.DirectionsService();
        const newDirections = {};
        (async () => {
            for (const bus of busRoutes) {
                const stops = routeStops[bus.tuyen_duong_id] || [];
                if (stops.length < 2) continue;
                const waypoints = stops.slice(1, stops.length - 1).map(stop => ({
                    location: { lat: Number(stop.latitude), lng: Number(stop.longitude) },
                    stopover: true
                }));
                const origin = { lat: Number(stops[0].latitude), lng: Number(stops[0].longitude) };
                const destination = { lat: Number(stops[stops.length - 1].latitude), lng: Number(stops[stops.length - 1].longitude) };
                await new Promise((resolve) => {
                    directionsService.route({
                        origin,
                        destination,
                        waypoints,
                        travelMode: window.google.maps.TravelMode.DRIVING
                    }, (result, status) => {
                        if (status === 'OK') {
                            newDirections[bus.id] = result;
                        }
                        resolve();
                    });
                });
            }
            setDirections(newDirections);
        })();
    }, [isLoaded, busRoutes, routeStops]);
    // #endregion

    // #region Tọa độ & options bản đồ
    const center = { lat: 10.8231, lng: 106.6297 };
    const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true
    };
    // #endregion

    // #region Hàm phụ trợ
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
        if (bus && map) {
            // Nếu vị trí xe trùng điểm đón/điểm đến, offset nhẹ để marker không bị che
            let lat = bus.latitude;
            let lng = bus.longitude;
            const stops = routeStops[bus.tuyen_duong_id] || [];
            if (stops.length >= 2) {
                const firstStop = stops[0];
                const lastStop = stops[stops.length - 1];
                if ((Math.abs(lat - Number(firstStop.latitude)) < 0.00001 && Math.abs(lng - Number(firstStop.longitude)) < 0.00001) ||
                    (Math.abs(lat - Number(lastStop.latitude)) < 0.00001 && Math.abs(lng - Number(lastStop.longitude)) < 0.00001)) {
                    lat += 0.0001;
                    lng += 0.0001;
                }
            }
            map.panTo({ lat, lng });
            map.setZoom(16);
            setSelectedBus(bus);
        }
    };
    // #endregion

    // #region Render UI
    return (
        <div className="routes-container">
            <div className="routes-main">
                <h1 className="routes-title">Tuyến đường các xe</h1>

                {/* Ô tìm kiếm xe buýt theo ID, trạng thái, trackingId */}
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

                {/* Bản đồ Google Maps, hiển thị marker và route */}
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
                            {/* Vẽ đường đi thực tế bằng DirectionsRenderer cho từng tuyến xe */}
                            {busRoutes.map((bus) => (
                                directions[bus.id] ? (
                                    <DirectionsRenderer
                                        key={`directions-${bus.id}`}
                                        directions={directions[bus.id]}
                                        options={{ polylineOptions: { strokeColor: '#007bff', strokeWeight: 4, strokeOpacity: 0.8 } }}
                                    />
                                ) : null
                            ))}

                            {/* Hiển thị marker vị trí xe, điểm đón, điểm đến cho từng tuyến */}
                            {busRoutes.map((bus) => (
                                (() => {
                                    const markers = [];
                                    markers.push(
                                        <Marker
                                            key={bus.id}
                                            position={{ lat: bus.latitude, lng: bus.longitude }}
                                            icon={getMarkerIcon(bus.speed, bus.isOnline)}
                                            onClick={() => setSelectedBus(bus)}
                                            title={`Xe ${bus.id}`}
                                        />
                                    );
                                    const stops = routeStops[bus.tuyen_duong_id] || [];
                                    if (stops.length >= 2) {
                                        const firstStop = stops[0];
                                        const lastStop = stops[stops.length - 1];
                                        markers.push(
                                            <Marker
                                                key={`pickup-${bus.id}`}
                                                position={{ lat: Number(firstStop.latitude), lng: Number(firstStop.longitude) }}
                                                icon={'http://maps.google.com/mapfiles/ms/icons/green-dot.png'}
                                                title={`Điểm đón: ${firstStop.ten_diem_dung}`}
                                            />,
                                            <Marker
                                                key={`dropoff-${bus.id}`}
                                                position={{ lat: Number(lastStop.latitude), lng: Number(lastStop.longitude) }}
                                                icon={'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
                                                title={`Điểm đến: ${lastStop.ten_diem_dung}`}
                                            />
                                        );
                                    }
                                    return markers;
                                })()
                            ))}

                            {/* InfoWindow hiển thị thông tin xe khi click marker hoặc bấm HIỂN THỊ */}
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

            {/* Sidebar danh sách xe buýt, hiển thị thông tin, điểm đón/điểm đến, nút HIỂN THỊ */}
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
    // #endregion
};

export default Routes;