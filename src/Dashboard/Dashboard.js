import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import './Dashboard.css';

//Dùng để lấy màu cho trạng thái.
const getStatusColor = (colorName) => { return `var(--color-${colorName})`; };

/**
@param {object} bus /*Đối tượng xe buýt từ API dashboard-info.
@returns {{statusName: string, statusText: string}} /*Tên màu và trạng thái.*/

const getStatusInfo = (bus) => {
    let statusName;
    let statusText;
 
    // Logic mới dựa trên trường `status` từ DB
    switch (bus.status) {
        case 'in_trip':
            statusName = 'green';
            statusText = 'Đang trong chuyến';
            break;
        case 'available':
            statusName = 'blue';
            statusText = 'Sẵn sàng';
            break;
        case 'maintenance':
            statusName = 'yellow';
            statusText = 'Đang bảo trì';
            break;
        case 'offline':
            statusName = 'red';
            statusText = 'Ngoại tuyến';
            break;
        default: // Xử lý các trường hợp không mong muốn
            statusName = 'red';
            statusText = 'Không xác định';
            break;
    }
    return { statusName, statusText };
};

/**
@param {object} student - Đối tượng học sinh từ API.
@returns {{colorName: string, statusText: string}} - Tên màu và trạng thái.
 */

const getStudentStatusInfo = (student) => {
    let colorName;
    switch (student.status) {
        case 'Đã đón':
            colorName = 'blue'; // Màu xanh dương cho trạng thái "Đã đón"
            break;
        case 'Nghỉ':
            colorName = 'red'; // Màu đỏ cho trạng thái "Nghỉ"
            break;
        case 'Chưa đón':
        default:
            colorName = 'yellow'; // Màu vàng cho trạng thái "Chưa đón"
            break;
    }
    return { colorName, statusText: student.status };
};

const getMarkerIcon = (bus) => {
   // Sử dụng getStatusInfo để lấy statusName
    const { statusName } = getStatusInfo(bus); 
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
    
    // Trả về đối tượng Icon cho Google Maps
    return {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", // Path hình giọt nước
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24) // Điểm neo của icon
    };
};


function Dashboard({ isLoaded, loadError, onNavigate }) { // 1. Nhận prop onNavigate
    const [busRoutes, setBusRoutes] = useState([]);
    const [kpiData, setKpiData] = useState({ percentage: 0, routes: 0, buses: 0, drivers: 0 }); // State cho KPIs
    const [studentList, setStudentList] = useState([]); // State mới cho học sinh
    const [selectedBus, setSelectedBus] = useState(null); 
    const [selectedBusDetails, setSelectedBusDetails] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 10.8231, lng: 106.6297 }); 
    const [map, setMap] = useState(null);
    const student_url = 'http://localhost:5000/students';
    const bus_url = 'http://localhost:5000/dashboard-info';
    const boundsFitted = useRef(false);
    const selectedBusRef = useRef(selectedBus);
    const selectedBusDetailsRef = useRef(selectedBusDetails);
    useEffect(() => {
        selectedBusRef.current = selectedBus;
        selectedBusDetailsRef.current = selectedBusDetails;
    }, [selectedBus, selectedBusDetails]);

    useEffect(() => {
        window.gm_authFailure = () => {
        console.error('Google Maps auth failed. Check API key, referrers, billing.');
    };

        fetchBusData();
        fetchStudentData();

        const intervalId = setInterval(fetchBusData, 5000); // 5000ms = 5 giây

        return () => { 
        clearInterval(intervalId);
        delete window.gm_authFailure; 
        };
    }, []); // Chỉ chạy một lần khi component mount

    // useEffect để tính toán KPIs từ dữ liệu frontend
    useEffect(() => {
        if (busRoutes.length > 0) {
            const totalBuses = busRoutes.length;
            const activeBuses = busRoutes.filter(bus => bus.status === 'in_trip' || bus.status === 'available').length;
            const percentage = totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0;

            setKpiData(prevData => ({
                ...prevData, // Giữ lại giá trị routes và drivers giả lập
                buses: totalBuses,
                percentage: percentage,
                routes: 2,
                drivers: 2, 
            }));
        }
    }, [busRoutes]); // Chạy lại mỗi khi busRoutes thay đổi

    // useEffect để tự động điều chỉnh map view cho vừa các marker
    useEffect(() => {
        // Chỉ chạy khi có map, có dữ liệu và chưa fit bounds lần nào
        if (map && busRoutes.length > 0 && !boundsFitted.current) {
            const bounds = new window.google.maps.LatLngBounds();
            busRoutes.forEach(bus => {
                bounds.extend({
                    lat: parseFloat(bus.latitude),
                    lng: parseFloat(bus.longitude)
                });
            });

            if (busRoutes.length > 1) {
                map.fitBounds(bounds);
            } else {
                // Nếu chỉ có 1 xe, chỉ cần căn giữa và set zoom mặc định
                map.setCenter(bounds.getCenter());
                map.setZoom(14);
            }
            boundsFitted.current = true;
        }
    }, [map, busRoutes]);

    //Hàm gọi bus cho map
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
            const newBusData = Array.isArray(result) ? result : [];

            // Cập nhật state chính
            setBusRoutes(newBusData); //Cập nhật state

            let busToSelect = null;

            // Sử dụng giá trị từ ref
            if (selectedBusDetailsRef.current) {
            //Nếu đã có xe buýt được chọn, tìm kiếm nó trong dữ liệu mới
            busToSelect = newBusData.find( // Tìm kiếm trong biến tạm
            bus => bus.bien_so_xe === selectedBusDetailsRef.current.bien_so_xe
            );
            }

                // Nếu không tìm thấy xe đang chọn hoặc chưa có xe nào được chọn thì chọn xe đầu tiên
                // Bỏ chọn xe đầu tiên để tránh map bị nhảy về xe đầu tiên khi không có xe nào được chọn
                if (!busToSelect && newBusData.length > 0) {
                     busToSelect = newBusData[0];
                    }
                
                // 4. Cập nhật state chỉ khi có xe để chọn
                if (busToSelect) {
        // Luôn cập nhật Card chi tiết
                    setSelectedBusDetails(busToSelect);
                    if (selectedBusRef.current) {
                    setSelectedBus(busToSelect); // Cập nhật vị trí cho InfoWindow đang mở
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

    // Hàm gọi API lấy danh sách học sinh
    const fetchStudentData = async () => {
        try {
            const response = await fetch(student_url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setStudentList(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudentList([]);
        }
    };

    const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '8px' };
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
                //Bắt sự kiện kéo bản đồ để cập nhật mapCenter, ngăn bản đồ giật về trung tâm
                onDragEnd={() => {
                    if (map) {
                        const newCenter = map.getCenter();
                        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
                    }
                }}
            >
                {busRoutes.map((bus) => (
                    <Marker
                        key={bus.bien_so_xe} // Dùng bien_so_xe làm key
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
                        onCloseClick={() => setSelectedBus(null)}
                    >
                        <div style={{ padding: '10px', minWidth: '200px', color: '#333' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Xe {selectedBus.bien_so_xe}</h3> 
                            <p style={{ margin: '5px 0' }}><strong>Tốc độ:</strong> {selectedBus.speed} km/h</p>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Trạng thái:</strong> {getStatusInfo(selectedBus).statusText}
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
                        {}
                        <div className="card overview-card">
                            <h3 className="card-title">Tổng quan hệ thống</h3>
                            <div className="overview-chart-section">
                                <div className="chart-placeholder" style={{backgroundImage: `conic-gradient(var(--color-green) ${kpiData.percentage}%, var(--card-dark-lighter) ${kpiData.percentage}%)`}}>
                                    <div className="percent-text">{kpiData.percentage}%</div>
                                </div>
                                <div className="overview-kpi">
                                    <p>Tuyến đường: <span className="font-semibold">{kpiData.routes}</span></p>
                                    <p>Số xe buýt: <span className="font-semibold">{kpiData.buses}</span></p>
                                    <p>Số tài xế: <span className="font-semibold">{kpiData.drivers}</span></p>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="card bus-selected-card">
                            <h3 className="card-title">Xe buýt đang chọn</h3>
                            {selectedBusDetails ? (
                                <>
                                    {}
                                    <p className="text-xl font-bold mb-2">Biển số: {selectedBusDetails.bien_so_xe}</p>
                                    <p className="mb-4 text-status-color" style={{color: getStatusColor(getStatusInfo(selectedBusDetails).statusName)}}>
                                        <span className="status-dot" style={{backgroundColor: getStatusColor(getStatusInfo(selectedBusDetails).statusName)}}></span> {getStatusInfo(selectedBusDetails).statusText}
                                    </p>
                                    
                                    <p>Tài xế: {selectedBusDetails.ho_ten || 'Chưa có thông tin'}</p> 
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
                        <h3 className="card-title">Tình trạng xe</h3>
                        <div className="status-list-content"> 
                            {busRoutes.length > 0 ? (
                                busRoutes.map(bus => {
                                    const { statusName, statusText } = getStatusInfo(bus);
                                    return (
                                        <p key={bus.bien_so_xe} className="mb-2 status-item">
                                            <span className="font-semibold">{bus.bien_so_xe}</span>: 
                                            {statusText} <span className="status-dot" style={{ backgroundColor: getStatusColor(statusName) }}></span>
                                        </p>
                                    );
                                })
                            ) : (
                                <p>Không có dữ liệu xe buýt.</p>
                            )}
                        </div>
                    </div>

                    {/*Card Danh sách học sinh */}
                    <div className="card student-list-card">
                        <h3 className="card-title">Danh sách học sinh:</h3>
                        <div className="status-list-content"> 
                            {studentList.length > 0 ? (
                                studentList.map(student => {
                                    const { colorName, statusText } = getStudentStatusInfo(student);
                                    return (
                                        <p key={student.id} className="mb-2 status-item">
                                            <span className="font-semibold">{student.ho_ten}</span>:  
                                            {statusText} <span className="status-dot" style={{backgroundColor: getStatusColor(colorName)}}></span>
                                        </p>
                                    );
                                })
                            ) : (
                                <p>Đang tải hoặc không có dữ liệu học sinh.</p>
                            )}
                        </div>
                    </div>

                    {/*Card Lịch trình */}
                    <div className="card schedule-card">
                        <h3 className="card-title">Lịch trình:</h3>
                        {/*Thêm sự kiện onClick */}
                        <button 
                            className="schedule-btn" 
                            onClick={() => onNavigate('schedule')}>
                            Tạo lịch trình mới
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;