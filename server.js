const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const db = require('./config');

const app = express();
const PORT = 5000;

// Google Maps API Key 
const GOOGLE_MAPS_API_KEY = 'AIzaSyDtViS_O_TRVKPXi43VpL-ZS3bRLeoOiVY';

app.use(cors());
app.use(express.json());

// Endpoint lấy danh sách học sinh
app.get('/students', (req, res) => {
  const query = 'SELECT * FROM HocSinh ORDER BY ho_ten';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn HocSinh:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu học sinh.' });
    }
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username và password là bắt buộc.' });
  }

  const query = 'SELECT * FROM TaiKhoan WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Username không tồn tại.' });
    }

    const user = results[0];
    // So sánh mật khẩu trực tiếp vì trong DB là plain text
    if (password === user.password_hash) {
      res.json({ message: 'Đăng nhập thành công!', user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ message: 'Mật khẩu không đúng.' });
    }
  });
});

app.get('/dashboard-info',(req, res)=>{
  const query = `SELECT 
        xb.*,
        tx.ho_ten
    FROM 
        trip t
    INNER JOIN 
        xebus xb ON t.xe_bus_id = xb.id
    INNER JOIN 
        taixe tx ON t.tai_xe_id = tx.id
    WHERE
        t.ngay = CURDATE();`;
  db.query(query, (err, results)=>{
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
    res.json(results);
  })
})

// Endpoint lấy danh sách xe bus
app.get('/buses', (req, res) => {
  const query = 'SELECT * FROM XeBus';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn XeBus:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu xe bus.' });
    }
    res.json(results);
  });
});

// Endpoint lấy danh sách tuyến đường với điểm đón/đến
app.get('/routes', (req, res) => {
  const query = `SELECT id, ten_tuyen_duong, mo_ta FROM tuyenduong ORDER BY id`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn tuyenduong:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu tuyến đường.' });
    }
    res.json(results);
  });
});

// Endpoint lấy các điểm dừng của 1 tuyến đường theo thứ tự
app.get('/routes/:id/stops', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT dd.*, tdd.thu_tu 
    FROM diemdung dd
    JOIN tuyenduong_diemdung tdd ON dd.id = tdd.diem_dung_id
    WHERE tdd.tuyen_duong_id = ?
    ORDER BY tdd.thu_tu ASC
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn điểm dừng của tuyến:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy điểm dừng.' });
    }
    res.json(results);
  });
});

// Endpoint lấy lịch trình (join nhiều bảng)
app.get('/schedules', (req, res) => {
    const query = `SELECT t.id,
           td.ten_tuyen_duong,
           tx.ho_ten AS tai_xe,
           xb.bien_so_xe,
           t.ngay,
           t.gio_xuat_phat,
           t.thu
         FROM trip t
         JOIN tuyenduong td ON t.tuyen_duong_id = td.id
         JOIN taixe tx ON t.tai_xe_id = tx.id
         JOIN xebus xb ON t.xe_bus_id = xb.id
         ORDER BY t.gio_xuat_phat`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn schedules:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu lịch trình.' });
    }
    res.json(results);
  });
});

// Endpoint lấy danh sách tài xế
app.get('/drivers', (req, res) => {
  const query = 'SELECT * FROM TaiXe ORDER BY ho_ten';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn TaiXe:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu tài xế.' });
    }
    res.json(results);
  });
});

// Endpoint mới để lấy dữ liệu KPIs (Tổng quan)
app.get('/kpis', async (req, res) => {
  try {
    const [busResults] = await db.promise().query('SELECT COUNT(*) as totalBuses FROM xebus');
    const [activeBusResults] = await db.promise().query("SELECT COUNT(*) as activeBuses FROM xebus WHERE status = 'in_trip' OR status = 'available'");
    const [routeResults] = await db.promise().query('SELECT COUNT(*) as totalRoutes FROM tuyenduong');
    const [driverResults] = await db.promise().query('SELECT COUNT(*) as totalDrivers FROM taixe');

    const totalBuses = busResults[0].totalBuses;
    const activeBuses = activeBusResults[0].activeBuses;
    const totalRoutes = routeResults[0].totalRoutes;
    const totalDrivers = driverResults[0].totalDrivers;

    // Tính toán tỷ lệ phần trăm xe đang hoạt động
    const percentage = totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0;

    res.json({
      percentage,
      routes: totalRoutes,
      buses: totalBuses,
      drivers: totalDrivers,
    });

  } catch (err) {
    console.error('Lỗi truy vấn KPIs:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu KPIs.' });
  }
});


// Endpoint lấy danh sách học sinh
// Endpoint tạo mới lịch trình (trip)
app.post('/schedules', (req, res) => {
  const {
    tuyen_duong_id,
    tai_xe_id,
    xe_bus_id,
    ngay,
    gio_xuat_phat,
    thu
  } = req.body;

  if (!tuyen_duong_id || !tai_xe_id || !xe_bus_id || !ngay || !gio_xuat_phat || !thu) {
    return res.status(400).json({ message: 'Thiếu thông tin lịch trình.' });
  }

  const query = `INSERT INTO trip (tuyen_duong_id, tai_xe_id, xe_bus_id, ngay, gio_xuat_phat, thu)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [tuyen_duong_id, tai_xe_id, xe_bus_id, ngay, gio_xuat_phat, thu], (err, result) => {
    if (err) {
      console.error('Lỗi tạo lịch trình:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi tạo lịch trình.' });
    }
    res.json({ message: 'Tạo lịch trình thành công!', id: result.insertId });
  });
});
app.get('/students', (req, res) => {
  const query = 'SELECT * FROM HocSinh ORDER BY ho_ten';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn HocSinh:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu học sinh.' });
    }
    res.json(results);
  });
});

// ==================== GOOGLE MAPS GEOCODING ====================

// Endpoint reverse geocoding: lat/lng -> tên địa điểm
app.post('/geocode/reverse', async (req, res) => {
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude và longitude là bắt buộc.' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=vi`;
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      res.json({
        formatted_address: result.formatted_address,
        place_name: result.address_components[0]?.long_name || result.formatted_address
      });
    } else {
      res.status(404).json({ message: 'Không tìm thấy địa điểm cho tọa độ này.' });
    }
  } catch (error) {
    console.error('Lỗi gọi Google Maps API:', error);
    res.status(500).json({ message: 'Lỗi khi gọi Google Maps API.' });
  }
});

// Endpoint cập nhật tên và địa chỉ điểm dừng từ tọa độ
app.put('/stops/:id/update-from-coords', async (req, res) => {
  const { id } = req.params;
  
  // Lấy tọa độ từ DB
  const getStopQuery = 'SELECT latitude, longitude FROM diemdung WHERE id = ?';
  db.query(getStopQuery, [id], async (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi lấy thông tin điểm dừng.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy điểm dừng.' });
    }
    
    const stop = results[0];
    if (!stop.latitude || !stop.longitude) {
      return res.status(400).json({ message: 'Điểm dừng chưa có tọa độ.' });
    }
    
    try {
      // Gọi Google Maps API
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${stop.latitude},${stop.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=vi`;
      const response = await axios.get(url);
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const placeName = result.address_components[0]?.long_name || result.formatted_address.split(',')[0];
        const address = result.formatted_address;
        
        // Cập nhật vào DB
        const updateQuery = 'UPDATE diemdung SET ten_diem_dung = ?, dia_chi = ? WHERE id = ?';
        db.query(updateQuery, [placeName, address, id], (updateErr) => {
          if (updateErr) {
            console.error('Lỗi cập nhật điểm dừng:', updateErr);
            return res.status(500).json({ message: 'Lỗi khi cập nhật điểm dừng.' });
          }
          
          res.json({
            message: 'Cập nhật thành công',
            ten_diem_dung: placeName,
            dia_chi: address
          });
        });
      } else {
        res.status(404).json({ message: 'Không tìm thấy địa điểm cho tọa độ này.' });
      }
    } catch (error) {
      console.error('Lỗi gọi Google Maps API:', error);
      res.status(500).json({ message: 'Lỗi khi gọi Google Maps API.' });
    }
  });
});

// Endpoint cập nhật tất cả điểm dừng từ tọa độ (batch update)
app.post('/stops/update-all-from-coords', async (req, res) => {
  const getStopsQuery = 'SELECT id, latitude, longitude FROM diemdung WHERE latitude IS NOT NULL AND longitude IS NOT NULL';
  
  db.query(getStopsQuery, async (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi lấy danh sách điểm dừng.' });
    }
    
    const updates = [];
    const errors = [];
    
    for (const stop of results) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${stop.latitude},${stop.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=vi`;
        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          const placeName = result.address_components[0]?.long_name || result.formatted_address.split(',')[0];
          const address = result.formatted_address;
          
          await new Promise((resolve, reject) => {
            const updateQuery = 'UPDATE diemdung SET ten_diem_dung = ?, dia_chi = ? WHERE id = ?';
            db.query(updateQuery, [placeName, address, stop.id], (updateErr) => {
              if (updateErr) reject(updateErr);
              else {
                updates.push({ id: stop.id, ten_diem_dung: placeName });
                resolve();
              }
            });
          });
        } else {
          errors.push({ id: stop.id, error: 'Không tìm thấy địa điểm' });
        }
        
        // Delay để tránh vượt quota Google Maps API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errors.push({ id: stop.id, error: error.message });
      }
    }
    
    res.json({
      message: 'Hoàn thành cập nhật',
      updated: updates.length,
      errors: errors.length,
      details: { updates, errors }
    });
  });
});

// ==================== QUẢN LÝ ĐIỂM DỪNG (STOPS CRUD) ====================

// GET: Lấy tất cả điểm dừng
app.get('/stops', (req, res) => {
  const query = 'SELECT * FROM diemdung ORDER BY id';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi lấy danh sách điểm dừng.' });
    }
    res.json(results);
  });
});

// GET: Lấy 1 điểm dừng theo ID
app.get('/stops/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM diemdung WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi lấy điểm dừng.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy điểm dừng.' });
    }
    res.json(results[0]);
  });
});

// POST: Tạo điểm dừng mới
app.post('/stops', (req, res) => {
  const { ten_diem_dung, dia_chi, latitude, longitude } = req.body;
  
  if (!ten_diem_dung || !latitude || !longitude) {
    return res.status(400).json({ message: 'Tên điểm dừng, latitude và longitude là bắt buộc.' });
  }
  
  const query = 'INSERT INTO diemdung (ten_diem_dung, dia_chi, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(query, [ten_diem_dung, dia_chi, latitude, longitude], (err, result) => {
    if (err) {
      console.error('Lỗi tạo điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi tạo điểm dừng.' });
    }
    res.status(201).json({ 
      message: 'Tạo điểm dừng thành công',
      id: result.insertId,
      ten_diem_dung,
      dia_chi,
      latitude,
      longitude
    });
  });
});

// PUT: Cập nhật điểm dừng
app.put('/stops/:id', (req, res) => {
  const { id } = req.params;
  const { ten_diem_dung, dia_chi, latitude, longitude } = req.body;
  
  const query = 'UPDATE diemdung SET ten_diem_dung = ?, dia_chi = ?, latitude = ?, longitude = ? WHERE id = ?';
  db.query(query, [ten_diem_dung, dia_chi, latitude, longitude, id], (err, result) => {
    if (err) {
      console.error('Lỗi cập nhật điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi cập nhật điểm dừng.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy điểm dừng.' });
    }
    res.json({ message: 'Cập nhật điểm dừng thành công' });
  });
});

// DELETE: Xóa điểm dừng
app.delete('/stops/:id', (req, res) => {
  const { id } = req.params;
  
  // Kiểm tra xem điểm dừng có đang được sử dụng không
  const checkQuery = 'SELECT COUNT(*) as count FROM tuyenduong_diemdung WHERE diem_dung_id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Lỗi kiểm tra điểm dừng:', err);
      return res.status(500).json({ message: 'Lỗi khi kiểm tra điểm dừng.' });
    }
    
    if (results[0].count > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa điểm dừng đang được sử dụng trong tuyến đường.',
        inUse: true
      });
    }
    
    const deleteQuery = 'DELETE FROM diemdung WHERE id = ?';
    db.query(deleteQuery, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Lỗi xóa điểm dừng:', deleteErr);
        return res.status(500).json({ message: 'Lỗi khi xóa điểm dừng.' });
      }
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy điểm dừng.' });
      }
      res.json({ message: 'Xóa điểm dừng thành công' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên http://localhost:${PORT}`);
});
