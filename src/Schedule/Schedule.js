import React, { useEffect, useState } from 'react';
import './Schedule.css';

const Schedule = () => {
  // State cho tab, form, và dữ liệu từ DB
  const [selectedTab, setSelectedTab] = useState('routes');
  const [routeName, setRouteName] = useState('');
  const [driverId, setDriverId] = useState('');
  const [busId, setBusId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dữ liệu từ API backend
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedulesRes, driversRes, busesRes, studentsRes] = await Promise.all([
          fetch('http://localhost:5000/schedules'),
          fetch('http://localhost:5000/drivers'),
          fetch('http://localhost:5000/buses'),
          fetch('http://localhost:5000/students')
        ]);
        if (!schedulesRes.ok) throw new Error(`HTTP ${schedulesRes.status}`);
        const schedulesData = await schedulesRes.json();
        const driversData = driversRes.ok ? await driversRes.json() : [];
        const busesData = busesRes.ok ? await busesRes.json() : [];
        const studentsData = studentsRes.ok ? await studentsRes.json() : [];
        setSchedules(schedulesData);
        setDrivers(driversData);
        setBuses(busesData);
        setStudents(studentsData);
        setError(null);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        if (err.message.includes('Failed to fetch')) {
          setError('Không thể kết nối server. Vui lòng kiểm tra server đã chạy chưa (node server.js)');
        } else {
          setError(`Lỗi: ${err.message}`);
        }
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const formatTime = (t) => t ? t.substring(0,5) : '--:--';

  // Nhóm lịch trình theo ngày trong tuần (giả định phân bổ đều)
  const groupByWeekday = () => {
    // Nhóm lịch trình theo thứ (dựa vào trường thu trong DB)
    const days = [[], [], [], [], [], []]; // Thứ 2-7
    schedules.forEach((sch) => {
      switch (sch.thu) {
        case '2': days[0].push(sch); break;
        case '3': days[1].push(sch); break;
        case '4': days[2].push(sch); break;
        case '5': days[3].push(sch); break;
        case '6': days[4].push(sch); break;
        case '7': days[5].push(sch); break;
        default: break;
      }
    });
    return days;
  };

  const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const daySchedules = groupByWeekday();

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <div className="schedule-main">
          <h2 className="schedule-title">Quản lí lịch trình</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${selectedTab === 'routes' ? 'active' : ''}`} 
              onClick={() => setSelectedTab('routes')}
            >Tất cả tuyến đường</button>
            <button 
              className={`tab-btn ${selectedTab === 'monthly' ? 'active' : ''}`} 
              onClick={() => setSelectedTab('monthly')}
            >Hàng tháng</button>
            <button 
              className={`tab-btn ${selectedTab === 'buses' ? 'active' : ''}`} 
              onClick={() => setSelectedTab('buses')}
            >Tất cả xe buýt</button>
          </div>
          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="error-state" style={{color:'red'}}>{error}</div>
          ) : (
            <div className="schedule-grid">
              <div className="day-headers">
                {weekdays.map(day => (
                  <div key={day} className="day-header">{day}</div>
                ))}
              </div>
              <div className="schedule-content">
                {daySchedules.map((dayItems, dayIdx) => (
                  <div key={dayIdx} className="day-column">
                    {dayItems.map(item => (
                      <div 
                        key={item.id} 
                        className="schedule-item"
                        onClick={() => {
                          setRouteName(item.ten_tuyen_duong);
                          // Tìm id tài xế từ danh sách drivers dựa vào tên
                          const driver = drivers.find(d => d.ho_ten === item.tai_xe);
                          setDriverId(driver ? driver.id : '');
                          // Tìm id xe buýt từ danh sách buses dựa vào biển số
                          const bus = buses.find(b => b.bien_so_xe === item.bien_so_xe);
                          setBusId(bus ? bus.id : '');
                          setStudentId(item.student_id || '');
                        }}
                      >
                        <div className="route-name">{item.ten_tuyen_duong}</div>
                        <div className="route-time">{formatTime(item.gio_xuat_phat)}</div>
                        <div className="route-driver">Tài xế: {item.tai_xe}</div>
                        <div className="route-bus">Xe: {item.bien_so_xe}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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
              <option value="">Tài xế</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.ho_ten}</option>
              ))}
            </select>
            <label>Xe buýt:</label>
            <select
              className="dropdown"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
            >
              <option value="">Bus</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.bien_so_xe}</option>
              ))}
            </select>
            <label>Danh sách học sinh:</label>
            <select
              className="dropdown"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Chọn học sinh</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.ho_ten}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-buttons">
            <button className="btn-save" onClick={handleSave}>Lưu</button>
            <button className="btn-cancel" onClick={handleCancel}>Hủy</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Schedule;