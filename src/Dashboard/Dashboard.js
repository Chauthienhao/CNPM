import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import './Dashboard.css'; // Đảm bảo file CSS này được load

// Dữ liệu mô phỏng Dashboard (KPIs)
const overviewData = { percentage: 85, routes: 25, buses: 300, drivers: 45 };

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

const getStatusInfo = (bus) => {
    let statusName;
    let statusText;
    let isOnline;

    if (bus.speed === 0) {
        statusName = 'red';      // Tốc độ 0: Đỏ (Offline/Đứng yên)
        statusText = 'Offline/Đứng yên';
        isOnline = false;
    } else if (bus.speed <= 15) {
        statusName = 'yellow';   // Tốc độ thấp: Vàng (Đang chậm)
        statusText = 'đang chậm';
        isOnline = true;
    } else {
        statusName = 'green';    // Tốc độ hợp lý: Xanh lá (Hoạt động)
        statusText = 'đang hoạt động';
        isOnline = true;
    }

    // Gán thêm trường status hoàn thành giả định cho một số xe
    if (bus.id === 4) { // Giả định xe có id=4 đã hoàn thành (chỉ để demo)
         statusName = 'blue';
         statusText = 'đã hoàn thành';
    }

    return { statusName, statusText, isOnline };
};

// HÀM NÀY ĐÃ ĐƯỢC XÓA (trước đây là getStatusColorName)

// Xác định ICON MARKER (Đã sửa lỗi gọi hàm không tồn tại và sử dụng SVG)
const getMarkerIcon = (bus) => {
    // SỬA LỖI: Sử dụng getStatusInfo để lấy statusName đã được tính toán
    const statusName = getStatusInfo(bus).statusName; 
    let color;

    if (statusName === 'red') {
        color = '#ff0000'; 
    } else if (statusName === 'yellow') {
        color = '#ffff00'; 
    } else if (statusName === 'blue') {
        color = '#4467C4';
    } else {
        color = '#90EE90'; // Xanh lá
    }
    
    // Trả về đối tượng Icon cho Google Maps, sử dụng SVG
    return {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", // Path hình giọt nước
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24) // Điểm neo của icon
    };
};


function Dashboard({ isLoaded, loadError }) {
    const [busRoutes, setBusRoutes] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null); 
    const [selectedBusDetails, setSelectedBusDetails] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 10.8231, lng: 106.6297 }); 
    const [map, setMap] = useState(null);
    const bus_url = 'http://localhost:5000/bus-location';

    useEffect(() => {
        window.gm_authFailure = () => {
            console.error('Google Maps auth failed. Check API key, referrers, billing.');
        };
        
        // 1. Tải dữ liệu ban đầu
        fetchBusData();
        
        // 2. Thiết lập interval
        const intervalId = setInterval(fetchBusData, 5000); // 5000ms = 5 giây

        return () => { 
            clearInterval(intervalId);
            delete window.gm_authFailure; 
        };
    }, [selectedBusDetails]);

    //Hàm gọi bus-location
    const fetchBusData = async () => {

        try {
            const response = await fetch(bus_url);
            if (response.status === 401) {
                console.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
                // Xử lý chuyển hướng đến trang đăng nhập
                return; 
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Cập nhật state chính
            setBusRoutes(result.data); 
            let busToSelect = null;

            if (selectedBusDetails) {
                // 2. Nếu đã có xe buýt được chọn, tìm kiếm nó trong dữ liệu mới
                busToSelect = result.data.find(
                    bus => bus.bien_so_xe === selectedBusDetails.bien_so_xe
                );
            }

            // 3. Nếu không tìm thấy xe đang chọn hoặc chưa có xe nào được chọn thì chọn xe đầu tiên
            if (!busToSelect && result.data.length > 0) {
                busToSelect = result.data[0];
            }
            
            // 4. Cập nhật state chỉ khi có xe để chọn
            if (busToSelect) {
                // Cập nhật cả InfoWindow và Card chi tiết
                setSelectedBusDetails(busToSelect);
                if (selectedBus) {
                    setSelectedBus(busToSelect);
                }
            } else {
                // Nếu không có xe nào (dữ liệu rỗng), reset lựa chọn
                setSelectedBusDetails(null);
                setSelectedBus(null);
            }

        } catch (error) {
            console.error('Failed to fetch bus locations:', error);
        }
    };

    const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '8px' };
    // const center = { lat: 10.8231, lng: 106.6297 }; // Biến này không cần nữa
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
        // Cập nhật vị trí trung tâm thành vị trí của xe vừa chọn
        setMapCenter({
            lat: parseFloat(bus.latitude),
            lng: parseFloat(bus.longitude)
        });
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
                center={mapCenter} // Sử dụng state mapCenter
                zoom={13}
                options={mapOptions}
                onLoad={(m) => setMap(m)}
                onUnmount={() => setMap(null)}
                // THÊM: Bắt sự kiện kéo bản đồ để cập nhật mapCenter, ngăn bản đồ giật về trung tâm mặc định
                onDragEnd={() => {
                    if (map) {
                        const newCenter = map.getCenter();
                        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
                    }
                }}
            >
                {busRoutes.map((bus) => (
                    <Marker
                        key={bus.bien_so_xe} // <--- Dùng bien_so_xe làm key
                        position={{ lat: parseFloat(bus.latitude), lng: parseFloat(bus.longitude) }}
                        icon={getMarkerIcon(bus)} 
                        onClick={() => updateSelectedBus(bus)}
                        title={`Xe ${bus.bien_so_xe}`}
                    />
                ))}

                {selectedBus && (
                    <InfoWindow
                        key={selectedBus.bien_so_xe} 
                        position={{ lat: parseFloat(selectedBus.latitude), lng: parseFloat(selectedBus.longitude) }}
                        // [ĐÃ SỬA] CHỈ TẮT InfoWindow
                        onCloseClick={() => setSelectedBus(null)}
                    >
                        <div style={{ padding: '10px', minWidth: '200px', color: '#333' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Xe {selectedBus.bien_so_xe}</h3> 
                            <p style={{ margin: '5px 0' }}><strong>Tốc độ:</strong> {selectedBus.speed} km/h</p>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Trạng thái:</strong> {getStatusInfo(selectedBus).isOnline ? '🟢 Online' : '🔴 Offline'}
                            </p>
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
                    <div className="card map-container">
                        {renderMap()}
                    </div>

                    <div className="right-panel">
                        {/* Cổng quan hệ thống (Giữ nguyên) */}
                        <div className="card overview-card">{/* ... */}</div>

                        {/* xe bus đang chọn (CẬP NHẬT) */}
                        <div className="card bus-selected-card">
                            <h3 className="card-title">Xe buýt đang chọn</h3>
                            {selectedBusDetails ? (
                                <>
                                    {/* SỬ DỤNG bien_so_xe */}
                                    <p className="text-xl font-bold mb-2">Biển số: {selectedBusDetails.bien_so_xe}</p>
                                    <p className="mb-4 text-status-color" style={{color: getStatusColor(getStatusInfo(selectedBusDetails).statusName)}}>
                                        <span className="status-dot" style={{backgroundColor: getStatusColor(getStatusInfo(selectedBusDetails).statusName)}}></span> {getStatusInfo(selectedBusDetails).statusText}
                                    </p>
                                    
                                    {/* TÀI XẾ KHÔNG CÓ TRONG DB => GIẢ LẬP/BỎ QUA */}
                                    <p>Tài xế: Không xác định (Chưa có trong DB)</p> 
                                    <p className="text-sm mt-2 text-gray-400">Tốc độ: {selectedBusDetails.speed} km/h</p>
                                </>
                            ) : (
                                <p>Đang tải dữ liệu hoặc vui lòng chọn xe buýt trên bản đồ.</p>
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