import React, { useState } from 'react';
import Header from '../Header/Header';
import SideBar from '../LeftSideBar/SideBar';
import './Taixe.css';
function Taixe() {
    const [activeMenu, setActiveMenu] = useState('driver');
    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        console.log('Menu clicked:', menuId);
    };
    const drivers = [
        { id: 1, name: 'Nguyễn Văn A', status: 'Hoạt động', email: 'vana@gmail.com' },
        { id: 2, name: 'Trần Thị B', status: 'Không hoạt động', email: 'thib@gmail.com' },
        { id: 3, name: 'Lê Văn C', status: 'Bận', email: 'vanc@gmail.com' },
        { id: 4, name: 'Phạm Minh D', status: 'Hoạt động', email: 'minhd@gmail.com' },
    ];
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
        <Header />
        <div className="Main">
            {/* Sidebar trái */}
            <SideBar activeMenu={activeMenu} onMenuClick={handleMenuClick}/>

            {/* Phần chính - Main và Search */}
            <div className="taixe-main">
                <h1 className='taixe-title'>Quản lý tài xế</h1>
                <div className='taixe-search'>
                    <input type="text" placeholder="Tìm kiếm thông tin tài xế..." className='taixe-input'/>
                    <button className='taixe-button'>🔍</button>
                </div>
                <table className="taixe-table">
                    <thead>
                        <tr>  
                            <th>ID</th>
                            <th>Tên tài xế</th>
                            <th>Trạng thái</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map((driver) => (
                        <tr key={driver.id}>
                            <td>{driver.id}</td>
                            <td>{driver.name}</td>
                            <td>
                            <span className={getStatusClass(driver.status)}>
                                {driver.status}
                            </span>
                            </td>
                            <td>{driver.email}</td>
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
  );
}

export default Taixe;