import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow} from '@react-google-maps/api';
import './Dashboard.css'; // Đảm bảo file CSS này được load

// Dữ liệu mô phỏng Dashboard (KPIs)
const overviewData = { percentage: 85, routes: 25, buses: 300, drivers: 45 };

// Dữ liệu vị trí xe 
const busRoutesData = [
    // Xe 01: Hoạt động (Xanh lá)
    { id: '01', trackingId: 'TRK001', latitude: 10.8231, longitude: 106.6297, speed: 25, isOnline: true, driver: 'G.Bình', status: 'đang hoạt động' },
    // Xe 02: Offline (Đỏ)
    { id: '02', trackingId: 'TRK002', latitude: 10.8331, longitude: 106.6397, speed: 0, isOnline: false, driver: 'Tài xế Tân', status: 'Offline' },
    // Xe 03: Đang chậm (Vàng) 
    { id: '03', trackingId: 'TRK003', latitude: 10.8131, longitude: 106.6197, speed: 14, isOnline: true, driver: 'Lê Văn C', status: 'đang chậm' },
    // Xe 04: Đã hoàn thành (Xanh Dương) 
    { id: '04', trackingId: 'TRK004', latitude: 10.8431, longitude: 106.6497, speed: 45, isOnline: true, driver: 'Phạm Minh D', status: 'đã hoàn thành' },
];

// Dữ liệu cho các Card hàng dưới (giữ nguyên để không phá vỡ bố cục)
const busStatusData = [
    { id: 'BUS 01', status: 'đang hoạt động', color: 'green' },
    { id: 'BUS 02', status: 'đang chậm tiến độ', color: 'yellow' },
    { id: 'BUS 03', status: 'đang hoạt động', color: 'green' },
    { id: 'BUS 04', status: 'đã hoàn thành', color: 'blue' },
];

const studentData = [
    { name: 'Nguyễn Văn A', status: 'đang đón', color: 'green' },
    { name: 'Trần Thị B', status: 'đón chậm', color: 'yellow' },
    { name: 'Bánh Văn C', status: 'đang đón', color: 'green' },
    { name: 'Trần Thanh D', status: 'đã đón', color: 'blue' },
];

// Hàm hỗ trợ
const getStatusColor = (colorName) => { return `var(--color-${colorName})`; };

// HÀM 1: Xác định TÊN MÀU (dùng cho Card)
const getStatusColorName = (bus) => {
    if (!bus.isOnline || bus.status === 'Offline') {
        return 'red'; // Mất kết nối (Đỏ)
    }
    if (bus.status.includes('hoàn thành')) {
        return 'blue'; // Đã hoàn thành (Xanh Dương)
    }
    if (bus.status.includes('chậm') || bus.speed <= 15) {
        return 'yellow'; // Đang chậm hoặc đứng yên/tốc độ thấp (Vàng)
    }
    return 'green'; // Mặc định là xanh lá (Online)
};

// HÀM 2: Xác định ICON MARKER
const getMarkerIcon = (bus) => {
    // SỬ DỤNG HÀM getStatusColorName để xác định màu chính xác
    const statusName = getStatusColorName(bus);

    if (statusName === 'red') {
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Đỏ
    }
    if (statusName === 'yellow') {
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'; // Vàng
    }
    if (statusName === 'blue') {
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // Xanh Dương
    }
    return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; // Xanh Lá
};


function Dashboard({ isLoaded, loadError }) {
    const [selectedBus, setSelectedBus] = useState(null); 
    const [selectedBusDetails, setSelectedBusDetails] = useState(busRoutesData[0]); 
    const [map, setMap] = useState(null);

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
        fullscreenControl: false
    };

    const updateSelectedBus = (bus) => {
        setSelectedBus(bus);
        setSelectedBusDetails(bus);
    };
    
    // Hàm render Map (JSX)
    const renderMap = () => {
        if (loadError) {
            return (
                <div className="map-placeholder">
                    <p className="map-placeholder-text">Không tải được Google Maps</p>
                </div>
            );
        }
        if (!isLoaded) {
            return (
                <div className="map-placeholder">
                    <p className="map-placeholder-text">Đang tải bản đồ...</p>
                </div>
            );
        }

        return (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={mapOptions}
                onLoad={(m) => setMap(m)}
                onUnmount={() => setMap(null)}
            >
                {busRoutesData.map((bus) => (
                    <Marker
                        key={bus.id}
                        position={{ lat: bus.latitude, lng: bus.longitude }}
                        // Sửa lỗi: Truyền toàn bộ object 'bus' vào
                        icon={getMarkerIcon(bus)} 
                        onClick={() => updateSelectedBus(bus)}
                        title={`Xe ${bus.id}`}
                    />
                ))}

                {selectedBus && (
                    <InfoWindow
                        position={{ lat: selectedBus.latitude, lng: selectedBus.longitude }}
                        onCloseClick={() => setSelectedBus(null)}
                    >
                        <div style={{ padding: '10px', minWidth: '200px', color: '#333' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Xe {selectedBus.id}</h3>
                            <p style={{ margin: '5px 0' }}><strong>Tracking ID:</strong> {selectedBus.trackingId}</p>
                            <p style={{ margin: '5px 0' }}><strong>Tốc độ:</strong> {selectedBus.speed} km/h</p>
                            <p style={{ margin: '5px 0' }}><strong>Trạng thái:</strong> {selectedBus.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        );
    };

    return (
        <div className="dashboard-content">
            
            <div className="dashboard-grid-wrapper">

                {/* Hàng trên: Bản đồ và các bảng bên phải */}
                <div className="dashboard-row-top">
            
                    {/* 1. Bản đồ khu vực (Map Container) */}
                    <div className="card map-container">
                        {renderMap()}
                    </div>

                    {/* 2. Bảng bên phải*/}
                    <div className="right-panel">
                        
                        {/* Cổng quan hệ thống */}
                        <div className="card overview-card">
                            <h3 className="card-title">Tổng quan hệ thống</h3>
                            <div className="overview-chart-section">
                                <div className="chart-placeholder" style={{backgroundImage: `conic-gradient(var(--color-green) ${overviewData.percentage}%, var(--card-dark-lighter) ${overviewData.percentage}%)`}}>
                                    <div className="percent-text">{overviewData.percentage}%</div>
                                </div>
                                <div className="overview-kpi">
                                    <p>Tuyến đường: <span className="font-semibold">{overviewData.routes}</span></p>
                                    <p>Số xe buýt: <span className="font-semibold">{overviewData.buses}</span></p>
                                    <p>Số tài xế: <span className="font-semibold">{overviewData.drivers}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* xe bus đang chọn */}
                        <div className="card bus-selected-card">
                            <h3 className="card-title">Xe buýt đang chọn</h3>
                            {selectedBusDetails ? (
                                <>
                                    <p className="text-xl font-bold mb-2">BUS {selectedBusDetails.id}</p>
                                    <p className="mb-4 text-status-color" style={{color: getStatusColor(getStatusColorName(selectedBusDetails))}}>
                                        <span className="status-dot" style={{backgroundColor: getStatusColor(getStatusColorName(selectedBusDetails))}}></span> {selectedBusDetails.status || 'Đang theo dõi'}
                                    </p>
                                    <p>Tài xế: {selectedBusDetails.driver}</p>
                                    <p className="text-sm mt-2 text-gray-400">Tốc độ: {selectedBusDetails.speed} km/h</p>
                                </>
                            ) : (
                                <p>Vui lòng chọn xe buýt trên bản đồ.</p>
                            )}
                        </div>
                        
                        {/* bảng cảnh báo sự cố gần đây */}
                        <div className="card bus-alert-card">
                            <h3 className="card-title">Cảnh báo sự cố gần đây</h3>
                            <p className="alert-text text-yellow-400 text-sm mb-1">
                                 Bus 02: đang chậm tiến độ (15 phút) - 9:30 SA
                            </p>
                            <p className="alert-text text-red-400 text-sm">
                                 Tài xế Tân: gặp một chút sự cố
                            </p>
                        </div>
                    </div>
                </div>

                {/* bảng bên dưới */}
                <div className="dashboard-row-bottom">
                    
                    {/*Tình trạng xe */}
                    <div className="card status-list-card">
                        <h3 className="card-title">Tình trạng:</h3>
                        {busStatusData.map(bus => (
                            <p key={bus.id} className="mb-2">
                                <span className="font-semibold">{bus.id}</span>: <span className="status-dot" style={{backgroundColor: getStatusColor(bus.color)}}></span> {bus.status}
                            </p>
                        ))}
                    </div>

                    {/*Card Danh sách học sinh */}
                    <div className="card student-list-card">
                        <h3 className="card-title">Danh sách học sinh:</h3>
                        {studentData.map((student, index) => (
                            <p key={index} className="mb-2">
                                <span className="font-semibold">{student.name}</span>: <span className="status-dot" style={{backgroundColor: getStatusColor(student.color)}}></span> {student.status}
                            </p>
                        ))}
                    </div>

                    {/*Card Lịch trình */}
                    <div className="card schedule-card">
                        <h3 className="card-title">Lịch trình:</h3>
                        <button className="schedule-btn">Tạo lịch trình mới</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;