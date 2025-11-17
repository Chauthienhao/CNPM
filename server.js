const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./config');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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

// Endpoint lấy danh sách tuyến đường
app.get('/routes', (req, res) => {
  const query = 'SELECT * FROM TuyenDuong';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn TuyenDuong:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu tuyến đường.' });
    }
    res.json(results);
  });
});

// Endpoint lấy lịch trình (join nhiều bảng)
app.get('/schedules', (req, res) => {
  const query = `SELECT lt.id,
                        td.ten_tuyen_duong,
                        tx.ho_ten AS tai_xe,
                        xb.bien_so_xe,
                        hs.ho_ten AS hoc_sinh,
                        don.ten_diem_dung AS diem_don,
                        den.ten_diem_dung AS diem_den,
                        lt.gio_xuat_phat
                 FROM LichTrinh lt
                 JOIN TuyenDuong td ON lt.tuyen_duong_id = td.id
                 JOIN TaiXe tx ON lt.tai_xe_id = tx.id
                 JOIN XeBus xb ON lt.xe_bus_id = xb.id
                 JOIN HocSinh hs ON lt.hoc_sinh_id = hs.id
                 JOIN DiemDung don ON lt.diem_don_id = don.id
                 JOIN DiemDung den ON lt.diem_den_id = den.id
                 ORDER BY lt.gio_xuat_phat`;
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

app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên http://localhost:${PORT}`);
});
