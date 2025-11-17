import React, { useState, useEffect } from 'react';
import { getDrivers } from '../services/api';
import './Taixe.css';

function Taixe() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getDrivers();
                if (mounted) setDrivers(Array.isArray(data) ? data : []);
            } catch (e) {
                if (mounted) setError('Không tải được danh sách tài xế');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);
     // Xử lý khi nhấn nút
    const handleEdit = (id) => {
        alert(`Sửa tài xế có ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm(`Bạn có chắc muốn xóa tài xế ID: ${id}?`)) {
        alert(`Đã xóa tài xế có ID: ${id}`);
        }
    };

    // Chuẩn hoá status từ DB (active / busy / inactive) -> VN + class
    const translateStatus = (raw) => {
        if (!raw) return 'Hoạt động';
        switch (raw.toLowerCase()) {
            case 'active': return 'Hoạt động';
            case 'busy': return 'Bận';
            case 'inactive': return 'Không hoạt động';
            default: return raw; // nếu đã là tiếng Việt
        }
    };
    const getStatusClass = (raw) => {
        const normalized = translateStatus(raw);
        switch (normalized) {
            case 'Hoạt động': return 'status active';
            case 'Không hoạt động': return 'status inactive';
            case 'Bận': return 'status busy';
            default: return 'status';
        }
    };
  return (
    <div className="app-wrapper">
        <div className="Main">
            {/* Sidebar trái */}
            {/* <SideBar activeMenu={activeMenu} onMenuClick={handleMenuClick}/> */}

            {/* Phần chính - Main và Search */}
            <div className="taixe-main">
                <h1 className='taixe-title'>Quản lý tài xế</h1>
                <div className='taixe-search'>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm thông tin tài xế..." 
                        className='taixe-input'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className='taixe-button'>🔍</button>
                </div>

                {loading && <div style={{padding: 12}}>Đang tải...</div>}
                {error && !loading && <div style={{color: 'red', padding: 12}}>{error}</div>}

                {!loading && !error && (
                <table className="taixe-table">
                    <thead>
                        <tr>  
                            <th>ID</th>
                            <th>Tên tài xế</th>
                            <th>Trạng thái</th>
                            <th>SĐT</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers
                            .filter(d => 
                                (d.ho_ten || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (d.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                String(d.id || '').includes(searchTerm)
                            )
                            .map((driver) => (
                            <tr key={driver.id}>
                                <td>{driver.id}</td>
                                <td>{driver.ho_ten || driver.name}</td>
                                <td>
                                    <span className={getStatusClass(driver.trang_thai || driver.status)}>
                                        {translateStatus(driver.trang_thai || driver.status || 'Hoạt động')}
                                    </span>
                                </td>
                                <td>{driver.so_dien_thoai || '—'}</td>
                                <td>{driver.email || '—'}</td>
                                <td>
                                <button className="edit-btn" onClick={() => handleEdit(driver.id)}>Sửa</button>
                                <button className="delete-btn" onClick={() => handleDelete(driver.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {drivers.filter(d => 
                            (d.ho_ten || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (d.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            String(d.id || '').includes(searchTerm)
                        ).length === 0 && (
                            <tr>
                                <td colSpan={6} style={{textAlign: 'center', padding: 12}}>Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>
        </div>
            
    </div>
  );
}

export default Taixe;