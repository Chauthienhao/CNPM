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

  const query = 'SELECT * FROM taikhoan WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Username không tồn tại.' });
    }

    const user = results[0];
    console.log("User row retrieved from DB:", JSON.stringify(user, null, 2));
    // Prepare user object to send, set default role if missing
    const responseUser = {
      id: user.id,
      username: user.username,
      role: user.role || 'admin',
    };
    // So sánh mật khẩu trực tiếp vì trong DB là plain text
    if (password === user.password_hash) {
      res.json({ message: 'Đăng nhập thành công!', user: responseUser });
    } else {
      res.status(401).json({ message: 'Mật khẩu không đúng.' });
    }
  });
});

app.get('/dashboard-info',(req, res)=>{
  // Lấy tất cả xe buýt và join với chuyến đi gần nhất để lấy tên tài xế
  const query = `
    SELECT 
        xb.id, 
        xb.bien_so_xe, 
        xb.latitude, 
        xb.longitude, 
        xb.speed, 
        xb.status,  
        xb.tuyen_duong_id, 
        tx.ho_ten AS ten_tai_xe
    FROM 
        xebus xb
    LEFT JOIN 
        (SELECT *, ROW_NUMBER() OVER(PARTITION BY xe_bus_id ORDER BY ngay DESC, id DESC) as rn FROM trip) t ON xb.id = t.xe_bus_id AND t.rn = 1
    LEFT JOIN 
        taixe tx ON t.tai_xe_id = tx.id
  `;
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

// GOOGLE MAPS GEOCODING 

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

//Lấy tất cả tài xế
app.get('/api/taixe', (req, res) => {
    // 1. Lấy tên bảng từ ảnh (taixe_1)
    // 2. Dùng AS để đổi tên cột 'ho_ten' -> 'name' cho khớp với React
    // 3. Dùng CASE để đổi 'status' (DB) -> 'status' (React)
    const query = `
        SELECT 
            id, 
            ho_ten AS name, 
            email, 
            so_dien_thoai,
            CASE 
                WHEN status = 'active' THEN 'Hoạt động'
                WHEN status = 'inactive' THEN 'Không hoạt động'
                WHEN status = 'busy' THEN 'Bận'
                ELSE status
            END AS status
        FROM taixe
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn danh sách tài xế:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ.' });
        }
        // Trả về mảng JSON chứa các tài xế
        res.json(results);
    });
});

// Thêm tài xế mới
app.post('/api/taixe', (req, res) => {
    const { name, email, so_dien_thoai, status } = req.body;

    if (!name || !email || !so_dien_thoai) {
        return res.status(400).json({ message: 'Thiếu dữ liệu.' });
    }

    // Map status từ UI -> DB
    let statusDB = 'active';
    if (status === 'Hoạt động') statusDB = 'active';
    else if (status === 'Bận') statusDB = 'busy';
    else if (status === 'Không hoạt động') statusDB = 'inactive';

    const query = `
        INSERT INTO taixe (tai_khoan_id, ho_ten, email, so_dien_thoai, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [3, name, email, so_dien_thoai, statusDB], (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm tài xế:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ khi thêm tài xế.' });
        }

        res.json({
            id: result.insertId,
            name,
            email,
            so_dien_thoai,
            status
        });
    });
});

// Sửa thông tin tài xế
app.put('/api/taixe/:id', (req, res) => {
    const { id } = req.params;
    
    // Lấy dữ liệu từ body
    const { name, email, so_dien_thoai, status } = req.body;

    // --- Validation chung ---
    
    // Nếu status được cung cấp (dù là kịch bản nào), nó phải là tiếng Anh
    if (status && !['active', 'busy', 'inactive'].includes(status)) {
         return res.status(400).json({ 
             message: `Trạng thái '${status}' cung cấp không hợp lệ. Phải là 'active', 'busy', hoặc 'inactive'.` 
         });
    }
    // 2 trường hợp: cập nhật thông tin hoặc chỉ trạng thái 
    if (name || email || so_dien_thoai) {
        if (!name || !email || !so_dien_thoai || !status) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp đầy đủ thông tin (tên, email, sđt, trạng thái tiếng Anh).' 
            });
        }
        const query = 'UPDATE taixe SET ho_ten = ?, email = ?, so_dien_thoai = ?, status = ? WHERE id = ?';
        const params = [name, email, so_dien_thoai, status, id];

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Lỗi khi cập nhật (full):', err);
                return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy tài xế.' });
            }
            res.json({ message: `Cập nhật thông tin thành công cho ID: ${id}` });
        });

    } 
    else if (status) {
        
        // 1. Validation (Đã kiểm tra ở trên)
        
        // 2. Query chỉ cập nhật status
        const query = 'UPDATE taixe SET status = ? WHERE id = ?';
        
        db.query(query, [status, id], (err, result) => {
             if (err) {
                console.error('Lỗi khi cập nhật (status only):', err);
                return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy tài xế.' });
            }
            res.json({ message: `Cập nhật trạng thái thành công cho ID: ${id}` });
        });

    } 
    else {
        return res.status(400).json({ message: 'Không có dữ liệu nào được cung cấp để cập nhật.' });
    }
});
    
// Xoá tài xế
app.delete('/api/taixe/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Vui lòng cung cấp ID tài xế.' });
    }

    // Câu query DELETE
    const query = 'DELETE FROM taixe WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa tài xế:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ khi xóa.' });
        }

        // Kiểm tra xem có dòng nào bị ảnh hưởng (bị xóa) không
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài xế để xóa.' });
        }

        // Thành công
        res.json({ message: `Đã xóa thành công tài xế có ID: ${id}` });
    });
});
app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên http://localhost:${PORT}`);
});

// Lấy danh sách thông báo
app.get('/notifications', (req, res) => {
  const sql = `
    SELECT tb.id,
           ph.ho_ten AS parent,
           hs.ho_ten AS student,
           tb.noi_dung AS content
    FROM ThongBao tb
    JOIN PhuHuynh ph ON tb.phu_huynh_id = ph.id
    JOIN HocSinh hs ON tb.hoc_sinh_id = hs.id
    ORDER BY tb.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Lấy danh sách phụ huynh
app.get('/parents', (req, res) => {
  const sql = 'SELECT id, ho_ten FROM PhuHuynh ORDER BY ho_ten';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Lấy danh sách học sinh
app.get('/students', (req, res) => {
  const sql = `SELECT id, ho_ten FROM HocSinh ORDER BY ho_ten`;
  db.query(sql, (err, results) => {
     if (err) return res.status(500).json({ error: err });
  
    res.json(results); // Trả về mảng JSON {id, name}
  });
});

// Thêm thông báo
app.post('/notifications', (req, res) => {
  const { parent_id, student_id, content } = req.body;
  const sql = 'INSERT INTO ThongBao (phu_huynh_id, hoc_sinh_id, noi_dung) VALUES (?, ?, ?)';
  db.query(sql, [parent_id, student_id, content], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, parent_id, student_id, content });
  });
});

// Xóa thông báo theo ID
app.delete('/notifications/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM ThongBao WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    res.json({ message: 'Xóa thông báo thành công' });
  });
});

// Cập nhật nội dung thông báo (chỉ sửa content)
app.put('/notifications/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const sql = 'UPDATE ThongBao SET noi_dung = ? WHERE id = ?';
  db.query(sql, [content, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    res.json({ message: 'Cập nhật thành công' });
  });
});

 // gui thong bao

app.post("/notifications/send-all", (req, res) => {
  const notes = req.body.notifications;

  console.log("Dữ liệu nhận từ client:", notes);

  if (!Array.isArray(notes) || notes.length === 0) {
    return res.status(400).json({ message: "Không có thông báo để gửi" });
  }

  console.log("Đang gửi thông báo tới phụ huynh...");
  console.log(notes);

  return res.json({ message: "Đã gửi tất cả thông báo thành công!" });
});