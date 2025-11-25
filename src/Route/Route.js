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
    // PATCH: Sửa lỗi khi gọi _clearLines của leaflet-routing-machine nếu _map bị null
    // Đảm bảo xóa các tuyến đường cũ mà không gây crash khi bản đồ bị null
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
    // Component Routing: Vẽ tuyến đường giữa các điểm dừng bằng leaflet-routing-machine
    // Tự động cleanup khi thay đổi stops hoặc khi component bị unmount
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
            // Danh sách điểm dừng cứng (lấy từ ảnh SQL)
            const fixedStops = [
                { id: 1, ten_diem_dung: 'Sunrise City North', latitude: 10.738, longitude: 106.699 },
                { id: 2, ten_diem_dung: 'Lotte Mart Q7', latitude: 10.735, longitude: 106.7 },
                { id: 3, ten_diem_dung: 'Đại học Tôn Đức Thắng', latitude: 10.732, longitude: 106.698 },
                { id: 4, ten_diem_dung: 'Trường THPT Lê Hồng Phong', latitude: 10.76, longitude: 106.682 },
                { id: 5, ten_diem_dung: 'Vinhomes Grand Park', latitude: 10.83, longitude: 106.833 },
                { id: 6, ten_diem_dung: 'Khu Công Nghệ Cao', latitude: 10.855, longitude: 106.785 },
                { id: 7, ten_diem_dung: 'Ngã 4 Thủ Đức', latitude: 10.85, longitude: 106.772 },
                { id: 8, ten_diem_dung: 'Trường Quốc Tế Á Châu', latitude: 10.798, longitude: 106.719 },
                { id: 9, ten_diem_dung: 'Emart Gò Vấp', latitude: 10.822, longitude: 106.693 },
                { id: 10, ten_diem_dung: 'Công viên Gia Định', latitude: 10.81, longitude: 106.68 },
            ];
        // Hàm lấy danh sách xe buýt có lịch trình trong tuần đã chọn
        // Lấy danh sách biển số xe buýt có lịch trình trong tuần đã chọn
        const getBusPlatesForSelectedWeek = () => {
            if (!selectedWeek || !weeks.length || !schedules.length) return [];
            const weekObj = weeks.find(w => w.value === selectedWeek);
            if (!weekObj) return [];
            // Lấy các lịch trình thuộc tuần
            const busPlates = schedules
                .filter(sch => {
                    const d = new Date(sch.ngay);
                    d.setHours(0,0,0,0);
                    const start = new Date(weekObj.start);
                    start.setHours(0,0,0,0);
                    const end = new Date(weekObj.end);
                    end.setHours(0,0,0,0);
                    return d >= start && d <= end;
                })
                .map(sch => sch.bien_so_xe)
                .filter(Boolean);
            // Loại bỏ trùng lặp
            return Array.from(new Set(busPlates));
        };
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
    // State cho tuần lịch trình
    const [weeks, setWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [schedules, setSchedules] = useState([]);
        // Hàm lấy danh sách tuần từ dữ liệu lịch trình
        const getWeeksFromData = (data) => {
            if (!data || data.length === 0) return [];
            const allDates = data.map(sch => sch.ngay).filter(Boolean);
            const dateObjs = allDates.map(d => new Date(d)).sort((a, b) => a - b);
            let minDate = new Date(dateObjs[0]);
            minDate.setHours(0,0,0,0);
            minDate.setDate(minDate.getDate() - ((minDate.getDay() + 6) % 7));
            let maxDate = new Date(dateObjs[dateObjs.length-1]);
            maxDate.setHours(0,0,0,0);
            maxDate.setDate(maxDate.getDate() + (7 - maxDate.getDay()) % 7);
            const weeks = [];
            let weekStart = new Date(minDate);
            let weekNum = 1;
            while (weekStart <= maxDate) {
                let weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const hasSchedule = dateObjs.some(d => d >= weekStart && d <= weekEnd);
                if (hasSchedule) {
                    weeks.push({
                        value: `${weekStart.getFullYear()}-${weekNum}`,
                        label: `Tuần ${weekNum} [${weekStart.toLocaleDateString('vi-VN')} - ${weekEnd.toLocaleDateString('vi-VN')}]`,
                        start: new Date(weekStart),
                        end: new Date(weekEnd)
                    });
                }
                weekStart.setDate(weekStart.getDate() + 7);
                weekNum++;
            }
            return weeks;
        };

    // #region useEffect - Fetch dữ liệu
    // Load xe buýt từ DB (XeBus)
    useEffect(() => {
            // Fetch danh sách xe buýt và lịch trình từ API backend
            const fetchBusesAndSchedules = async () => {
                try {
                    if (loading) setLoading(false);
                    // Fetch buses
                    const res = await fetch('http://localhost:5000/buses');
                    if (!res.ok) throw new Error('Network response was not ok');
                    const data = await res.json();
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
                    // Fetch schedules để lấy tuần
                    const schedulesRes = await fetch('http://localhost:5000/schedules');
                    if (schedulesRes.ok) {
                        const schedulesData = await schedulesRes.json();
                        setSchedules(schedulesData);
                        const weekList = getWeeksFromData(schedulesData);
                        setWeeks(weekList);
                        // Nếu chưa chọn tuần, tự động chọn tuần đầu tiên
                        if (!selectedWeek && weekList.length > 0) setSelectedWeek(weekList[0].value);
                    }
                    setError(null);
                } catch (err) {
                    console.error('Lỗi tải dữ liệu xe/lịch trình:', err);
                    setError('Không thể tải danh sách xe/lịch trình');
                    setBusRoutes([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchBusesAndSchedules();
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

    // REGION: CÁCH TÍNH THỜI GIAN ĐẾN (ETA)
    // - Nếu có dữ liệu từ Directions API: dùng getEtaFromDirections để lấy tổng thời gian di chuyển thực tế theo tuyến đường (legs).
    // - Nếu không có dữ liệu route thực tế: dùng calculateETA, tính ETA dựa vào tốc độ hiện tại của xe và khoảng cách đến điểm cuối tuyến (haversineDistance).
    // - ETA = (quãng đường / tốc độ) * 60 (phút)
    // - Nếu speed <= 0 hoặc thiếu dữ liệu: trả về 'N/A'.

    // REGION: CÁCH ROUTING TÌM ĐƯỜNG ĐI
    // - Sử dụng leaflet-routing-machine để vẽ tuyến đường giữa các điểm dừng (stops).
    // - Tạo các waypoint từ danh sách stops (tọa độ lat/lng).
    // - Routing sẽ tự động tìm đường đi ngắn nhất giữa các waypoint trên bản đồ.
    // - Khi stops thay đổi hoặc component unmount, tự động cleanup tuyến đường cũ.

    // Lấy thời gian đến dự kiến từ Directions API
    function getEtaFromDirections(directions) {
    // Hàm lấy thời gian đến dự kiến từ Directions API (nếu dùng)
    // Trả về tổng thời gian di chuyển (phút) qua các legs của route
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
        // Hàm tính ETA đơn giản dựa vào tốc độ và khoảng cách đến điểm cuối
        function haversineDistance(lat1, lon1, lat2, lon2) {
            // Hàm tính khoảng cách giữa 2 tọa độ (km) theo công thức Haversine
            // Dùng cho tính ETA đơn giản khi không có dữ liệu route thực tế
            const R = 6371; // Bán kính Trái Đất (km)
            // Chuyển đổi độ sang radian cho vĩ độ và kinh độ
            const dLat = (lat2 - lat1) * Math.PI / 180; // Độ chênh lệch vĩ độ (radian)
            const dLon = (lon2 - lon1) * Math.PI / 180; // Độ chênh lệch kinh độ (radian)
            // Tính giá trị a theo công thức Haversine
            // a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            // Tính giá trị c: khoảng cách góc giữa 2 điểm trên mặt cầu
            // c = 2 * atan2(√a, √(1−a))
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            // Khoảng cách thực tế giữa 2 điểm (km)
            return R * c;
        }

        function calculateETA(bus, destination) {
            // Hàm tính thời gian đến (ETA) dựa vào tốc độ xe và khoảng cách đến điểm cuối
            // Nếu không đủ dữ liệu hoặc tốc độ <= 0 thì trả về 'N/A'
            if (!bus || !destination || !bus.speed || bus.speed <= 0) return 'N/A';
            const distance = haversineDistance(bus.latitude, bus.longitude, destination.latitude, destination.longitude);
            const etaMinutes = Math.round((distance / bus.speed) * 60); // phút
            return `${etaMinutes} phút`;
        }
    const filteredRoutes = busRoutes.filter(route =>
        (
            route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
        ) && getBusPlatesForSelectedWeek().includes(route.trackingId)
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
                <div style={{marginBottom:'10px'}}>
                    <label style={{marginRight:'8px'}}>Chọn tuần lịch trình:</label>
                    <select
                        className="dropdown"
                        value={selectedWeek}
                        onChange={e => setSelectedWeek(e.target.value)}
                        style={{minWidth:'220px', color:'#111'}}
                    >
                        {weeks.map(week => (
                            <option key={week.value} value={week.value} style={{color:'#111'}}>{week.label}</option>
                        ))}
                    </select>
                </div>
                <div className="map-container">
                    <MapContainer center={center} zoom={13} style={{ width: '100%', height: '650px', borderRadius: '8px' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank' rel='noopener noreferrer'>OpenStreetMap</a> contributors"
                        />
                        {/* Hiển thị tất cả các điểm dừng cứng trên bản đồ, KHÔNG nối polyline giữa các điểm dừng cứng */}
                        {fixedStops.map(stop => (
                            <Marker
                                key={`fixedstop-${stop.id}`}
                                position={[stop.latitude, stop.longitude]}
                                icon={blueIcon}
                            >
                                <Popup>
                                    <span><strong>{stop.ten_diem_dung}</strong><br/>Vĩ độ: {stop.latitude}<br/>Kinh độ: {stop.longitude}</span>
                                </Popup>
                            </Marker>
                        ))}
                        {/* ...existing code... */}
                        {Object.entries(routeStops).map(([routeId, stops]) => (
                            stops.length >= 2 ? (
                                <>
                                    {/* Polyline chỉ cho các tuyến đường, không nối các điểm dừng cứng */}
                                    <Polyline
                                        key={`polyline-${routeId}`}
                                        positions={stops.map(stop => [Number(stop.latitude), Number(stop.longitude)])}
                                        pathOptions={{ color: '#888', weight: 3, opacity: 0.6, dashArray: '6' }}
                                    />
                                    <Routing key={`routing-${routeId}`} stops={stops} />
                                </>
                            ) : null
                        ))}

                        {busRoutes.filter(bus => getBusPlatesForSelectedWeek().includes(bus.trackingId)).map((bus) => {
                            // Tìm lịch trình của xe trong tuần đã chọn
                            const weekObj = weeks.find(w => w.value === selectedWeek);
                            let scheduleDate = '';
                            let gioXuatPhat = '';
                            if (weekObj) {
                                const sch = schedules.find(sch => sch.bien_so_xe === bus.trackingId && new Date(sch.ngay) >= weekObj.start && new Date(sch.ngay) <= weekObj.end);
                                if (sch) {
                                    scheduleDate = sch.ngay;
                                    gioXuatPhat = sch.gio_xuat_phat;
                                }
                            }
                            return (
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
                                                <p style={{ margin: '5px 0' }}><strong>Ngày chạy:</strong> {scheduleDate ? new Date(scheduleDate).toLocaleDateString('vi-VN') : 'Không xác định'}</p>
                                                <p style={{ margin: '5px 0' }}><strong>Giờ xuất phát:</strong> {gioXuatPhat || 'Không xác định'}</p>
                                                <p style={{ margin: '5px 0', fontSize: 12 }}>
                                                    <strong>Vĩ độ:</strong> {bus.latitude.toFixed(6)}<br/>
                                                    <strong>Kinh độ:</strong> {bus.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                        </Popup>
                                    )}
                                </Marker>
                            );
                        })}
                        {busRoutes.filter(bus => getBusPlatesForSelectedWeek().includes(bus.trackingId)).map((bus) => {
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
                            // Debug: log giá trị speed và isOnline để kiểm tra logic
                            console.log(`Bus ${route.id} - speed:`, route.speed, 'isOnline:', route.isOnline);
                            const stops = routeStops[route.tuyen_duong_id] || [];
                            const firstStop = stops[0];
                            const lastStop = stops[stops.length - 1];
                            let eta = 'N/A';
                            if (lastStop) {
                                if (!route.isOnline) {
                                    eta = 'Xe offline';
                                } else if (route.speed > 0) {
                                    eta = calculateETA(route, lastStop);
                                } else if (route.speed === 0) {
                                    eta = 'Xe đang dừng';
                                }
                            }
                            return (
                                <div key={route.id} className="route-card">
                                    <div className="route-header">
                                        <span className="route-id">XE: {route.id}</span>
                                    </div>
                                    <div style={{marginBottom: '8px', fontWeight: 'bold', color: '#00e676'}}>
                                        Thời gian đến: {eta}
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