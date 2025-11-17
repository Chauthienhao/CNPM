import React, { useState, useEffect } from 'react';
// import Header from '../Header/Header';
// import SideBar from '../LeftSideBar/SideBar';
import './Taixe.css';
function Taixe() {
    //const [activeMenu, setActiveMenu] = useState('driver');
    // const handleMenuClick = (menuId) => {
    //     setActiveMenu(menuId);
    //     console.log('Menu clicked:', menuId);
    // };
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [newDriver, setNewDriver] = useState({
        name: "",
        email: "",
        so_dien_thoai: "",
        status: "Hoạt động"
    });
    const [drivers, setDrivers] = useState([]);
    useEffect(() => {
        // Hàm để lấy dữ liệu
        const fetchDrivers = async () => {
            try {
                // Gọi API bạn vừa tạo ở Bước 1
                const response = await fetch('http://localhost:5000/api/taixe');
                if (!response.ok) {
                    console.error("API call failed:", response.status);
                    return; 
                }
                const data = await response.json();
                
                // Cập nhật state với dữ liệu từ API
                setDrivers(data); 
            } catch (error) {
                console.error("Lỗi khi fetch danh sách tài xế:", error);
            }
        };

        fetchDrivers(); // Gọi hàm
    }, []);
    // hàm thêm tài xế
    const handleSaveNewDriver = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/taixe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newDriver)
            });

            if (response.ok) {
                const created = await response.json();

                setDrivers(prev => [...prev, created]); // thêm vào bảng

                setShowAddPopup(false); // tắt popup

                setNewDriver({
                    name: "",
                    email: "",
                    so_dien_thoai: "",
                    status: "Hoạt động"
                });

            } else {
                alert("Thêm thất bại, kiểm tra API.");
            }

        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối API!");
        }
    };

    // hàm xử lý trạng thái 
    const handleStatusClick = async (driverToUpdate) => {
        const currentStatus = driverToUpdate.status; // "Hoạt động", "Bận", ...

        let nextStatusDb = '';      // Giá trị gửi xuống DB ('active', 'busy', ...)
        let nextStatusDisplay = ''; // Giá trị hiển thị trên UI ('Hoạt động', 'Bận', ...)

        // Logic xoay vòng: Hoạt động -> Bận -> Không hoạt động -> Hoạt động
        if (currentStatus === 'Hoạt động') {
            nextStatusDb = 'busy';
            nextStatusDisplay = 'Bận';
        } else if (currentStatus === 'Bận') {
            nextStatusDb = 'inactive';
            nextStatusDisplay = 'Không hoạt động';
        } else if (currentStatus === 'Không hoạt động') {
            nextStatusDb = 'active';
            nextStatusDisplay = 'Hoạt động';
        } else {
            return; // Nếu trạng thái không xác định, không làm gì cả
        }

        // Gọi API để cập nhật
        try {
            const response = await fetch(`http://localhost:5000/api/taixe/${driverToUpdate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: nextStatusDb }) // Gửi status (DB) mới
            });

            if (response.ok) {
                // Cập nhật state của React ngay lập tức để UI thay đổi
                setDrivers(prevDrivers => 
                    prevDrivers.map(driver => 
                        driver.id === driverToUpdate.id 
                            ? { ...driver, status: nextStatusDisplay } // Cập nhật trạng thái (UI)
                            : driver
                    )
                );
            } else {
                alert('Cập nhật trạng thái thất bại.');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            alert('Lỗi kết nối khi cập nhật trạng thái.');
        }
    };

     // Xử lý khi nhấn nút
    const handleEdit = (id) => {
        alert(`Sửa tài xế có ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm(`Bạn có chắc muốn xóa tài xế ID: ${id}?`)) {
        alert(`Đã xóa tài xế có ID: ${id}`);
        }
    };

    // Trả về className cho trạng thái
    const getStatusClass = (status) => {
        switch (status) {
        case 'Hoạt động':
            return 'status active';
        case 'Không hoạt động':
            return 'status inactive';
        case 'Bận':
            return 'status busy';
        default:
            return 'status';
        }
    };
  return (
    <div className="app-wrapper">
        {showAddPopup && (
        <div className="add-popup-overlay">
            <div className="add-popup-content">
                <h2>Thêm tài xế mới</h2>

                <input 
                    type="text" 
                    placeholder="Tên tài xế"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                />

                <input 
                    type="email" 
                    placeholder="Email"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                />

                <input 
                    type="text" 
                    placeholder="Số điện thoại"
                    value={newDriver.so_dien_thoai}
                    onChange={(e) => setNewDriver({ ...newDriver, so_dien_thoai: e.target.value })}
                />

                <select
                    value={newDriver.status}
                    onChange={(e) => setNewDriver({ ...newDriver, status: e.target.value })}
                >
                    <option>Hoạt động</option>
                    <option>Bận</option>
                    <option>Không hoạt động</option>
                </select>

                <div className="popup-actions">
                    <button className="btn-cancel" onClick={() => setShowAddPopup(false)}>Hủy</button>
                    <button className="btn-save" onClick={handleSaveNewDriver}>Lưu</button>
                </div>
            </div>
        </div>
    )}
        <div className="Main">
            {/* Sidebar trái */}
            {/* <SideBar activeMenu={activeMenu} onMenuClick={handleMenuClick}/> */}

            {/* Phần chính - Main và Search */}
            <div className="taixe-main">
                <h1 className='taixe-title'>Quản lý tài xế</h1>
                <div className='taixe-search'>
                    <input type="text" placeholder="Tìm kiếm thông tin tài xế..." className='taixe-input'/>
                    <button className='taixe-button'>🔍</button>
                    <button className='taixe-button-add' onClick={() => setShowAddPopup(true)}>Thêm tài xế</button>
                </div>
                <div className='table-container'>
                    <table className="taixe-table">
                        <thead>
                            <tr>  
                                <th>ID</th>
                                <th>Tên tài xế</th>
                                <th>Trạng thái</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver) => (
                                <tr key={driver.id}>
                                    <td>{driver.id}</td>
                                    <td>{driver.name}</td>
                                    <td>
                                    <span className={getStatusClass(driver.status)} onClick={() => handleStatusClick(driver)}>
                                        {driver.status}
                                    </span>
                                    </td>
                                    <td>{driver.email}</td>
                                    <td>{driver.so_dien_thoai}</td>
                                    <td>
                                    <button className="edit-btn" onClick={() => handleEdit(driver.id)}>Sửa</button>
                                    <button className="delete-btn" onClick={() => handleDelete(driver.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
            
    </div>
  );
}

export default Taixe;