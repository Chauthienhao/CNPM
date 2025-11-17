import React, { useEffect, useMemo, useState } from 'react';
import { getStudents } from '../services/api';
import "./Student.css"

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getStudents();
                if (mounted) setStudents(Array.isArray(data) ? data : []);
            } catch (e) {
                if (mounted) setError('Không tải được danh sách học sinh');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return students.filter(s =>
            String(s.id).toLowerCase().includes(q) ||
            (s.ho_ten || '').toLowerCase().includes(q) ||
            (s.email || '').toLowerCase().includes(q) ||
            (s.status || '').toLowerCase().includes(q)
        );
    }, [students, search]);

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
        <>
            <div className="title">
                <h1 className="">Quản Lý Học Sinh</h1>
            </div>

            <div className="search-form">
                <input
                    placeholder="Tìm kiếm học sinh...."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <br/>
                <button className="add-btn" type="button">Thêm Học Sinh</button>
            </div>

            <div className="table-form">
                {loading && <div style={{padding: 12}}>Đang tải...</div>}
                {error && !loading && <div style={{color: 'red', padding: 12}}>{error}</div>}
                {!loading && !error && (
                    <table className="hocsinh-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Học Sinh</th>
                                <th>Trạng Thái</th>
                                <th>Email</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filtered.map((hs) => (
                            <tr key={hs.id}>
                                <td>{hs.id}</td>
                                <td>{hs.ho_ten}</td>
                                <td className={getStatusClass(hs.status)}>{hs.status || '—'}</td>
                                <td>{hs.email || '—'}</td>
                                <td>
                                    <button className="edit-btn">Sửa</button>
                                    {' '}
                                    <button className="delete-btn">Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>Không có dữ liệu</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

export default Students;