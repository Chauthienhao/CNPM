import React, { useState, useEffect } from 'react';
import { getSchedules } from '../services/api';
import './Schedule.css';

const Schedule = () => {
  const [selectedTab, setSelectedTab] = useState('routes');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeName, setRouteName] = useState('');
  const [driverId, setDriverId] = useState('');
  const [busId, setBusId] = useState('');
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSchedules();
        if (mounted) setSchedules(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError('Không tải được lịch trình');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSave = () => {
    console.log({ routeName, driverId, busId, studentId });
    alert('Đã lưu thông tin!');
  };

  const handleCancel = () => {
    setRouteName('');
    setDriverId('');
    setBusId('');
    setStudentId('');
  };

  // Nhóm lịch trình theo ngày trong tuần (demo - có thể customize)
  const groupByDay = () => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const grouped = {};
    days.forEach(d => { grouped[d] = []; });
    
    // Phân phối lịch trình vào các ngày (đơn giản: chia đều)
    schedules.forEach((sch, idx) => {
      const dayIdx = idx % 6;
      grouped[days[dayIdx]].push({
        route: sch.tuyen_duong || 'N/A',
        time: sch.gio_xuat_phat || 'N/A'
      });
    });
    return grouped;
  };

  const scheduleData = groupByDay();

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <div className="schedule-main">
          <h2 className="schedule-title">Quản lí lịch trình</h2>

          {loading && <div style={{padding: 12}}>Đang tải...</div>}
          {error && !loading && <div style={{color: 'red', padding: 12}}>{error}</div>}

          {!loading && !error && (
            <>
              <div className="tab-buttons">
                <button
                  className={`tab-btn ${selectedTab === 'routes' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('routes')}
                >
                  Tất cả tuyến đường
                </button>
                <button
                  className={`tab-btn ${selectedTab === 'monthly' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('monthly')}
                >
                  Hàng tháng
                </button>
                <button
                  className={`tab-btn ${selectedTab === 'bus' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('bus')}
                >
                  Tất cả xe buýt
                </button>
              </div>

              <div className="calendar-wrapper">
                <div className="schedule-grid">
                  <div className="day-headers">
                    {days.map((day) => (
                      <div key={day} className="day-header">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="schedule-content">
                    {days.map((day) => (
                      <div key={day} className="day-column">
                        {scheduleData[day].map((item, index) => (
                          <div key={index} className="schedule-item">
                            <div className="route-name">{item.route}</div>
                            <div className="route-time">{item.time}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="schedule-sidebar">
          <div className="sidebar-section">
            <h3>Chi tiết:</h3>

            <label>Tên tuyến đường</label>
            <div className="readonly-field">
              {routeName || 'Chọn tuyến từ bản đồ'}
            </div>

            <label>Tài xế:</label>
            <select
              className="dropdown"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Chọn tài xế</option>
              <option value="driver1">Nguyễn Văn A</option>
              <option value="driver2">Trần Thị B</option>
              <option value="driver3">Lê Văn C</option>
            </select>

            <label>Xe buýt:</label>
            <select
              className="dropdown"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
            >
              <option value="">Chọn xe buýt</option>
              <option value="bus1">XE 01</option>
              <option value="bus2">XE 02</option>
              <option value="bus3">XE 03</option>
            </select>

            <label>Danh sách học sinh:</label>
            <select
              className="dropdown"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Chọn học sinh</option>
              <option value="student1">Học sinh 01</option>
              <option value="student2">Học sinh 02</option>
              <option value="student3">Học sinh 03</option>
            </select>
          </div>

          <div className="sidebar-buttons">
            <button className="btn-cancel" onClick={handleCancel}>
              Hủy
            </button>
            <button className="btn-save" onClick={handleSave}>
              Lưu
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Schedule;