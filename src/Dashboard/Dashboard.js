import React, { useEffect, useState, useRef, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Dashboard.css';
import 'leaflet-routing-machine';

// --- HELPERS ---
const getStatusColor = (colorName) => `var(--color-${colorName})`;

const getStatusInfo = (bus) => {
    switch (bus.status) {
        case 'in_trip': return { statusName: 'green', statusText: 'Đang trong chuyến' };
        case 'available': return { statusName: 'blue', statusText: 'Sẵn sàng' };
        case 'maintenance': return { statusName: 'yellow', statusText: 'Đang bảo trì' };
        case 'offline': return { statusName: 'red', statusText: 'Ngoại tuyến' };
        default: return { statusName: 'red', statusText: 'Không xác định' };
    }
};

const getStudentStatusInfo = (student) => {
    switch (student.status) {
        case 'Đã đón': return { colorName: 'blue', statusText: student.status };
        case 'Nghỉ': return { colorName: 'red', statusText: student.status };
        default: return { colorName: 'yellow', statusText: student.status };
    }
};

// --- ICONS ---
const getMarkerIcon = (bus) => {
    const { statusName } = getStatusInfo(bus);
    let iconUrl;
    // Dùng icon online để đảm bảo load được ảnh
    switch (statusName) {
        case 'red': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'; break;
        case 'yellow': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'; break; // Dùng orange thay yellow cho rõ
        case 'blue': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'; break;
        case 'green': default: iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'; break;
    }
    return new L.Icon({
        iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], // Size chuẩn của leaflet marker
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const stopIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Icon trạm dừng dạng tròn nhỏ
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
});

const studentIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2995/2995620.png', // Icon học sinh
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
});

// 1. Component xử lý bay tới xe bus (tách biệt để không render lại map)
const FlyToBus = ({ selectedBus }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedBus && selectedBus.latitude && selectedBus.longitude) {
            map.flyTo([parseFloat(selectedBus.latitude), parseFloat(selectedBus.longitude)], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [selectedBus, map]);
    return null;
};

// 2. Component vẽ Routing (Logic cập nhật waypoints)
const RoutingMachine = ({ waypoints }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    // Init Control (Chạy 1 lần)
    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [],
            lineOptions: {
                styles: [{ color: '#007bff', weight: 6, opacity: 0.6 }]
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false, // QUAN TRỌNG: Tắt tự động zoom
            show: false,
            createMarker: () => null // Không tạo marker của thư viện routing
        });

        routingControl.addTo(map);
        routingControlRef.current = routingControl;

        return () => {
            if (map && routingControlRef.current) {
                try { map.removeControl(routingControlRef.current); } catch(e){}
            }
        };
    }, [map]);

    // Update Waypoints (Chạy khi props đổi)
    useEffect(() => {
        if (routingControlRef.current) {
            routingControlRef.current.setWaypoints(waypoints || []);
        }
    }, [waypoints]);

    return null;
};

// 3. Component Route + Stops (Memoized để tránh tính toán lại)
const RouteLayer = memo(({ selectedBusDetails, routeStops, studentList }) => {
    const waypoints = useMemo(() => {
        if (!selectedBusDetails || !selectedBusDetails.tuyen_duong_id) return null;
        const stops = routeStops[selectedBusDetails.tuyen_duong_id];
        if (!stops || stops.length === 0 || !selectedBusDetails.latitude) return null;

        return [
            L.latLng(parseFloat(selectedBusDetails.latitude), parseFloat(selectedBusDetails.longitude)),
            ...stops.map(stop => L.latLng(stop.latitude, stop.longitude))
        ];
    }, [selectedBusDetails, routeStops]);

    const stopsToRender = selectedBusDetails ? routeStops[selectedBusDetails.tuyen_duong_id] || [] : [];

    return (
        <>
            <RoutingMachine waypoints={waypoints} />
            {stopsToRender.map(stop => {
                const studentsWaiting = studentList.filter(s => s.diem_dung_id === stop.id && s.status === 'Chưa đón');
                return (
                    <Marker 
                        key={`stop-${stop.id}`} 
                        position={[stop.latitude, stop.longitude]} 
                        icon={stopIcon}
                        zIndexOffset={0} // Trạm nằm dưới cùng
                    >
                        <Popup>
                            <strong>Trạm: {stop.ten_diem_dung}</strong>
                            {studentsWaiting.length > 0 ? (
                                <div style={{marginTop: '5px', fontSize: '12px'}}>
                                    <strong>Học sinh đang chờ:</strong>
                                    <ul style={{paddingLeft: '20px', margin: '5px 0 0 0', listStyleType: 'disc'}}>
                                        {studentsWaiting.map(student => (
                                            <li key={student.id}>{student.ho_ten}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div style={{marginTop: '5px', fontSize: '12px', fontStyle: 'italic'}}>Không có học sinh nào đang chờ.</div>
                            )}
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
});


// --- COMPONENT CHÍNH ---

function Dashboard({ isLoaded, loadError, onNavigate }) {
    const [busRoutes, setBusRoutes] = useState([]);
    const [kpiData, setKpiData] = useState({ percentage: 0, routes: 0, buses: 0, drivers: 0 });
    const [studentList, setStudentList] = useState([]);
    const [routeStops, setRouteStops] = useState({});
    
    const [selectedBus, setSelectedBus] = useState(null); // Để trigger hiệu ứng flyTo
    const [selectedBusDetails, setSelectedBusDetails] = useState(null); // Để vẽ route
    
    const selectedBusDetailsRef = useRef(null);

    // Cập nhật ref mỗi khi state thay đổi để dùng trong setInterval
    useEffect(() => {
        selectedBusDetailsRef.current = selectedBusDetails;
    }, [selectedBusDetails]);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchBus(), fetchStudents(), fetchRoutes()]);
        };
        fetchData();

        const intervalId = setInterval(fetchBus, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchBus = async () => {
        try {
            const res = await fetch('http://localhost:5000/dashboard-info');
            if (res.ok) {
                const data = await res.json();
                const buses = Array.isArray(data) ? data : [];
                setBusRoutes(buses);

                // Cập nhật vị trí realtime cho xe đang chọn
                if (selectedBusDetailsRef.current) {
                    const updated = buses.find(b => b.bien_so_xe === selectedBusDetailsRef.current.bien_so_xe);
                    setSelectedBusDetails(updated || null);
                }
            }
        } catch (e) { console.error("Bus fetch error", e); }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch('http://localhost:5000/students');
            if (res.ok) setStudentList(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchRoutes = async () => {
        try {
            const res = await fetch('http://localhost:5000/routes');
            if (res.ok) {
                const routes = await res.json();
                const stopsMap = {};
                for (const route of routes) {
                    const stopsRes = await fetch(`http://localhost:5000/routes/${route.id}/stops`);
                    if (stopsRes.ok) stopsMap[route.id] = await stopsRes.json();
                }
                setRouteStops(stopsMap);
            }
        } catch (e) { console.error(e); }
    };

    // KPI Calc
    useEffect(() => {
        if (busRoutes.length > 0) {
            const active = busRoutes.filter(b => b.status === 'in_trip' || b.status === 'available').length;
            setKpiData({
                percentage: Math.round((active / busRoutes.length) * 100),
                buses: busRoutes.length,
                routes: 2,
                drivers: 2
            });
        }
    }, [busRoutes]);

    const handleBusClick = (bus) => {
        setSelectedBus(bus); // Trigger flyTo
        setSelectedBusDetails(bus); // Trigger vẽ route
    };

    const renderMap = () => {
        if (loadError) return <div>Lỗi Map</div>;
        if (!isLoaded) return <div>Loading Map...</div>;

        return (
            <MapContainer
                center={[10.8231, 106.6297]}
                zoom={13}
                style={{ width: '100%', height: '100%', borderRadius: '8px' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />

                {/* Điều khiển Camera */}
                <FlyToBus selectedBus={selectedBus} />

                {/* Lớp vẽ Route & Stops (Đã tách ra ngoài) */}
                <RouteLayer 
                    selectedBusDetails={selectedBusDetails}
                    routeStops={routeStops}
                    studentList={studentList}
                />

                {/* Marker Xe Bus */}
                {busRoutes.map(bus => (
                    bus.latitude && (
                        <Marker
                            key={bus.bien_so_xe}
                            position={[parseFloat(bus.latitude), parseFloat(bus.longitude)]}
                            icon={getMarkerIcon(bus)}
                            zIndexOffset={1000} // QUAN TRỌNG: Xe luôn nằm trên trạm
                            eventHandlers={{ click: () => handleBusClick(bus) }}
                        >
                            <Popup>
                                <b>{bus.bien_so_xe}</b><br/>
                                {getStatusInfo(bus).statusText}
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Marker Học sinh */}
                {studentList.map(s => (
                    s.latitude && (
                        <Marker 
                            key={`st-${s.id}`} 
                            position={[s.latitude, s.longitude]} 
                            icon={studentIcon}
                            zIndexOffset={500} // Học sinh nằm giữa
                        >
                            <Popup>{s.ho_ten} - {s.status}</Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        );
    };

    return (
        <div className="dashboard-content">
            <div className="dashboard-grid-wrapper">
                <div className="dashboard-row-top">
                    <div className="card map-container">
                        {renderMap()}
                    </div>
                    
                    <div className="right-panel">
                         {/* Card Overview */}
                         <div className="card overview-card">
                            <h3 className="card-title">Tổng quan</h3>
                            <div className="overview-chart-section">
                                <div className="chart-placeholder" style={{backgroundImage: `conic-gradient(var(--color-green) ${kpiData.percentage}%, var(--card-dark-lighter) ${kpiData.percentage}%)`}}>
                                    <div className="percent-text">{kpiData.percentage}%</div>
                                </div>
                                <div className="overview-kpi">
                                    <p>Xe: {kpiData.buses} | Tài xế: {kpiData.drivers}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Selected Bus */}
                        <div className="card bus-selected-card">
                            <h3 className="card-title">Chi tiết xe</h3>
                            {selectedBusDetails ? (
                                <div>
                                    <p className="text-xl font-bold">{selectedBusDetails.bien_so_xe}</p>
                                    <p className="mb-2" style={{color: getStatusColor(getStatusInfo(selectedBusDetails).statusName)}}>
                                        {getStatusInfo(selectedBusDetails).statusText}
                                    </p>
                                    <p className="text-sm">Tài xế: <strong>{selectedBusDetails.ten_tai_xe || 'Chưa có'}</strong></p>
                                    <p className="text-sm">Tổng số học sinh: <strong>{selectedBusDetails.tong_so_hoc_sinh || 0}</strong></p>
                                    {selectedBusDetails.danh_sach_ten_hoc_sinh && (
                                        <p className="text-xs text-gray-400 mt-1">({selectedBusDetails.danh_sach_ten_hoc_sinh})</p>
                                    )}

                                </div>
                            ) : <p>Chọn xe trên bản đồ để xem lộ trình</p>}
                        </div>

                         {/* Card Alert */}
                         <div className="card bus-alert-card">
                            <h3 className="card-title">Thông báo</h3>
                            <p className="alert-text text-yellow-400">Hệ thống hoạt động bình thường</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-row-bottom">
                     {/* List Xe */}
                     <div className="card status-list-card">
                        <h3 className="card-title">Danh sách xe</h3>
                        <div className="status-list-content">
                            {busRoutes.map(bus => (
                                <p key={bus.bien_so_xe} className="mb-2 status-item">
                                    <b>{bus.bien_so_xe}</b>
                                    <span className="status-dot" style={{backgroundColor: getStatusColor(getStatusInfo(bus).statusName)}}></span>
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* List Học sinh */}
                    <div className="card student-list-card">
                        <h3 className="card-title">Học sinh</h3>
                        <div className="status-list-content">
                            {studentList.map(s => (
                                <p key={s.id} className="mb-2 status-item">
                                    {s.ho_ten} ({s.status})
                                    <span className="status-dot" style={{backgroundColor: getStatusColor(getStudentStatusInfo(s).colorName)}}></span>
                                </p>
                            ))}
                        </div>
                    </div>
                    
                    <div className="card schedule-card">
                         <h3 className="card-title">Lịch trình</h3>
                         <button className="schedule-btn" onClick={() => onNavigate('schedule')}>Quản lý</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;