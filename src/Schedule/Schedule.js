import React, { useEffect, useState } from 'react';
import './Schedule.css';

const Schedule = () => {
    // State cho dropdown tuần
    const [selectedWeek, setSelectedWeek] = useState('');

    // Hàm lấy danh sách tuần từ dữ liệu
    const getWeeksFromData = (data) => {
      if (data.length === 0) return [];
      const allDates = data.map(sch => sch.ngay).filter(Boolean);
      const dateObjs = allDates.map(d => new Date(d)).sort((a, b) => a - b);
      let minDate = new Date(dateObjs[0]);
      minDate.setHours(0,0,0,0);
      minDate.setDate(minDate.getDate() - ((minDate.getDay() + 6) % 7));
      let maxDate = new Date(dateObjs[dateObjs.length-1]);
      maxDate.setHours(0,0,0,0);
      maxDate.setDate(maxDate.getDate() + (7 - maxDate.getDay()) % 7);
      const weeks = [];
      let weekStart = new Date(minDate);
      let weekNum = 1;
      while (weekStart <= maxDate) {
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const hasSchedule = dateObjs.some(d => d >= weekStart && d <= weekEnd);
        if (hasSchedule) {
          weeks.push({
            value: `${weekStart.getFullYear()}-${weekNum}`,
            label: `Tuần ${weekNum} [từ ngày ${weekStart.toLocaleDateString('vi-VN')} đến ngày ${weekEnd.toLocaleDateString('vi-VN')}]`,
            start: new Date(weekStart),
            end: new Date(weekEnd)
          });
        }
        weekStart.setDate(weekStart.getDate() + 7);
        weekNum++;
      }
      return weeks;
    };

    // Hàm lấy tuần từ schedules (dùng cho dropdown)
    const getWeeks = () => getWeeksFromData(schedules);
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
  const [selectedDate, setSelectedDate] = useState('');
  // Thêm state lưu id lịch trình được chọn
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

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
        // Nếu chưa chọn tuần, tự động chọn tuần đầu tiên
        if (!selectedWeek && schedulesData.length > 0) {
          const weeks = getWeeksFromData(schedulesData);
          if (weeks.length > 0) setSelectedWeek(weeks[0].value);
        }
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

  // Hàm fetch lại lịch trình từ server
  const fetchSchedules = async () => {
    try {
      const res = await fetch('http://localhost:5000/schedules');
      const data = await res.json();
      if (res.ok) {
        setSchedules(data);
      }
    } catch (err) {
      // Có thể xử lý lỗi nếu cần
    }
  };

  // Hàm xác nhận: thêm lịch trình vào DB khi đủ dữ kiện (trừ học sinh)
  const handleSave = async () => {
    if (!routeName || !driverId || !busId || !selectedDate) {
      alert('Vui lòng nhập đầy đủ tuyến đường, tài xế, xe buýt và ngày!');
      return;
    }
    // Tìm id tuyến đường nếu đã có, nếu chưa thì gửi tên lên backend
    const route = schedules.find(sch => sch.ten_tuyen_duong === routeName);
    const tuyen_duong_id = route ? route.id : null;
    // Cho nhập giờ xuất phát
    const gio_xuat_phat = prompt('Nhập giờ xuất phát (hh:mm):', '08:00');
    if (!gio_xuat_phat) return;
    const thu = new Date(selectedDate).getDay().toString();
    try {
      const body = {
        tai_xe_id: driverId,
        xe_bus_id: busId,
        ngay: selectedDate,
        gio_xuat_phat,
        thu
      };
      if (tuyen_duong_id) {
        body.tuyen_duong_id = tuyen_duong_id;
      } else {
        body.ten_tuyen_duong = routeName;
      }
      const res = await fetch('http://localhost:5000/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Thêm lịch trình thành công!');
        await fetchSchedules(); // Reload lại danh sách lịch trình
      } else {
        alert(data.message || 'Lỗi thêm lịch trình!');
      }
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  };

  // Hàm xóa lịch trình đang được chọn
  const handleDelete = async () => {
    if (!selectedScheduleId) {
      alert('Vui lòng chọn lịch trình để xóa!');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa lịch trình này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/trip/${selectedScheduleId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Xóa lịch trình thành công!');
        await fetchSchedules(); // Reload lại danh sách lịch trình
        setSelectedScheduleId(null);
      } else {
        alert(data.message || 'Lỗi xóa lịch trình!');
      }
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
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

  // Hàm tìm kiếm lịch trình từ server, truyền thông tin tuần nếu có
  const handleSearch = async () => {
    const params = [];
    if (selectedDate) params.push(`ngay=${selectedDate}`);
    if (driverId) params.push(`tai_xe_id=${driverId}`);
    if (busId) params.push(`xe_bus_id=${busId}`);
    // Luôn truyền start_date và end_date nếu chọn tuần, để backend chỉ tìm trong tuần đó
    if (selectedWeek) {
      const weekObj = getWeeks().find(w => w.value === selectedWeek);
      if (weekObj) {
        const formatDate = d => {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth()+1).padStart(2,'0');
          const dd = String(d.getDate()).padStart(2,'0');
          return `${yyyy}-${mm}-${dd}`;
        };
        params.push(`start_date=${formatDate(weekObj.start)}`);
        params.push(`end_date=${formatDate(weekObj.end)}`);
      }
    }
    // Nếu không nhập gì thì báo yêu cầu nhập ít nhất 1 điều kiện
    if (params.length === 0) {
      alert('Vui lòng nhập ít nhất một điều kiện tìm kiếm (ngày, tài xế hoặc mã xe buýt hoặc tuần)!');
      return;
    }
    const queryString = '?' + params.join('&');
    try {
      const res = await fetch(`http://localhost:5000/schedules/search${queryString}`);
      const data = await res.json();
      if (res.ok) {
        if (data.length === 0) {
          alert('Không tìm thấy lịch trình phù hợp!');
        } else {
          alert('Kết quả tìm kiếm:\n' + data.map(sch => `${sch.ten_tuyen_duong} - ${sch.tai_xe} - ${sch.bien_so_xe} - ${sch.ngay} ${sch.gio_xuat_phat}`).join('\n'));
        }
      } else {
        alert(data.message || 'Lỗi tìm kiếm!');
      }
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  };




  // Lọc lịch trình theo tuần được chọn
  let filteredSchedules;
  if (selectedWeek) {
    const weekObj = getWeeks().find(w => w.value === selectedWeek);
    if (weekObj) {
      filteredSchedules = schedules.filter(sch => {
        const d = new Date(sch.ngay);
        // Chuẩn hóa về 0h00 để so sánh chỉ theo ngày
        d.setHours(0,0,0,0);
        const start = new Date(weekObj.start);
        start.setHours(0,0,0,0);
        const end = new Date(weekObj.end);
        end.setHours(0,0,0,0);
        return d >= start && d <= end;
      });
    } else {
      filteredSchedules = schedules;
    }
  } else {
    filteredSchedules = schedules;
  }

  // Lọc lịch trình theo tuần được chọn
 

  const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  // Nhóm lịch trình theo ngày trong tuần dựa trên filteredSchedules
  const daySchedules = (() => {
    const days = [[], [], [], [], [], []];
    filteredSchedules.forEach((sch) => {
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
  })();

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <div className="schedule-main">
          <h2 className="schedule-title">Quản lí lịch trình</h2>
          <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'10px'}}>
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${selectedTab === 'routes' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('routes')}
              >Tất cả tuyến đường</button>
            </div>
            {/* Dropdown chọn tuần */}
            <div>
              <label style={{marginRight:'8px'}}>Chọn tuần:</label>
              <select
                className="dropdown"
                value={selectedWeek}
                onChange={e => setSelectedWeek(e.target.value)}
              >
                {getWeeks().map(week => (
                  <option key={week.value} value={week.value}>{week.label}</option>
                ))}
              </select>
            </div>
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
                          setSelectedScheduleId(item.id);
                          setRouteName(item.ten_tuyen_duong);
                          // Tìm id tài xế từ danh sách drivers dựa vào tên
                          const driver = drivers.find(d => d.ho_ten === item.tai_xe);
                          setDriverId(driver ? driver.id : '');
                          // Tìm id xe buýt từ danh sách buses dựa vào biển số
                          const bus = buses.find(b => b.bien_so_xe === item.bien_so_xe);
                          setBusId(bus ? bus.id : '');
                          setStudentId(item.student_id || '');
                          setSelectedDate(item.ngay);
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
              {/* Bộ lọc ngày phía trên tên tuyến đường */}
              <label>Lọc theo ngày:</label>
              <input
                type="date"
                className="dropdown"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{marginBottom: '10px'}}
              />
              <label>Tên tuyến đường</label>
              <input
                type="text"
                className="dropdown"
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
                placeholder="Nhập tên tuyến đường"
                style={{marginBottom: '10px'}}
              />
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
            {/* </select>
            <label>Danh sách học sinh:</label>
            <select
              className="dropdown"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            > */}
              <option value="">Chọn học sinh</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.ho_ten}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-buttons" style={{display:'flex', gap:'10px'}}>
            <button className="btn-save" onClick={handleSave}>Xác nhận</button>
            <button className="btn-cancel" onClick={handleSearch}>Tìm kiếm</button>
            <button className="btn-cancel" onClick={handleCancel}>Hủy</button>
            <button className="btn-cancel" onClick={handleDelete}>Xóa</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Schedule;