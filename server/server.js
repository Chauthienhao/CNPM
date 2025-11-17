const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// DB config – set via environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartschoolbus',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

let pool;

async function initDb() {
  pool = await mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Root helper
app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>SmartSchoolBus API</h1>
    <p>API is running on port ${PORT}.</p>
    <ul>
      <li><a href="/api/health">/api/health</a></li>
      <li><a href="/api/routes">/api/routes</a></li>
      <li><a href="/api/stops">/api/stops</a></li>
      <li><a href="/api/buses">/api/buses</a></li>
      <li><a href="/api/students">/api/students</a></li>
      <li><a href="/api/drivers">/api/drivers</a></li>
    </ul>
    <p>Frontend UI runs at <strong>http://localhost:3000/</strong></p>
  `);
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Học sinh
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, ho_ten, email, COALESCE(trang_thai, 'Hoạt động') AS status FROM hocsinh`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/students error primary:', err.code || err.message);
    try {
      const [basic] = await pool.query(`SELECT id, ho_ten FROM hocsinh`);
      res.json(basic.map(r => ({ ...r, email: null, status: 'Hoạt động' })));
    } catch (err2) {
      console.error('GET /api/students fallback error:', err2.code || err2.message);
      res.status(200).json([]);
    }
  }
});

// Tài xế
app.get('/api/drivers', async (req, res) => {
  console.log('Request /api/drivers');
  try {
    const [rows] = await pool.query(
      `SELECT id,
              COALESCE(ho_ten, ten, ten_tai_xe) AS ho_ten,
              COALESCE(trang_thai, status, 'Hoạt động') AS trang_thai,
              email,
              so_dien_thoai
         FROM taixe`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/drivers primary error:', err.code || err.message);
    // Dự phòng: cột tối thiểu
    try {
      const [basic] = await pool.query(`SELECT id, ho_ten FROM taixe`);
      res.json(basic.map(r => ({ id: r.id, ho_ten: r.ho_ten, trang_thai: 'Hoạt động', email: null, so_dien_thoai: null })));
    } catch (err2) {
      console.error('GET /api/drivers fallback error:', err2.code || err2.message);
      res.status(200).json([]);
    }
  }
});
app.get('/api/routes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, ten_tuyen_duong AS name, mo_ta FROM tuyenduong`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/routes error:', err.code || err.message);
    res.status(200).json([]);
  }
});

// Stops
app.get('/api/stops', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, ten_diem_dung, dia_chi, latitude, longitude FROM diemdung`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/stops error:', err.code || err.message);
    res.status(200).json([]);
  }
});

// Buses
app.get('/api/buses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, bien_so_xe, latitude, longitude, speed FROM xebus`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/buses error:', err.code || err.message);
    res.status(200).json([]);
  }
});

// Lịch trình
app.get('/api/schedules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT lt.id,
              lt.gio_xuat_phat,
              td.ten_tuyen_duong AS tuyen_duong,
              tx.ho_ten AS tai_xe,
              xb.bien_so_xe AS xe_bus,
              hs.ho_ten AS hoc_sinh,
              dd_don.ten_diem_dung AS diem_don,
              dd_den.ten_diem_dung AS diem_den
         FROM LichTrinh lt
         JOIN TuyenDuong td ON lt.tuyen_duong_id = td.id
         JOIN TaiXe tx ON lt.tai_xe_id = tx.id
         JOIN XeBus xb ON lt.xe_bus_id = xb.id
         JOIN HocSinh hs ON lt.hoc_sinh_id = hs.id
         JOIN DiemDung dd_don ON lt.diem_don_id = dd_don.id
         JOIN DiemDung dd_den ON lt.diem_den_id = dd_den.id
         ORDER BY lt.gio_xuat_phat`
    );
    res.json(rows);
  } catch (e) {
    console.error('schedules error:', e.message);
    res.json([]);
  }
});
// Thông báo
app.get('/api/notifications', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tb.id, tb.noi_dung, tb.created_at,
              ph.ho_ten AS phu_huynh, hs.ho_ten AS hoc_sinh
         FROM ThongBao tb
         JOIN PhuHuynh ph ON tb.phu_huynh_id = ph.id
         JOIN HocSinh hs ON tb.hoc_sinh_id = hs.id
         ORDER BY tb.created_at DESC`
    );
    return res.json(rows);
  } catch (e1) {
    console.warn('created_at missing? fallback:', e1.message);
    try {
      const [rows2] = await pool.query(
        `SELECT tb.id, tb.noi_dung,
                ph.ho_ten AS phu_huynh, hs.ho_ten AS hoc_sinh
           FROM ThongBao tb
           JOIN PhuHuynh ph ON tb.phu_huynh_id = ph.id
           JOIN HocSinh hs ON tb.hoc_sinh_id = hs.id
           ORDER BY tb.id DESC`
      );
      return res.json(rows2);
    } catch (e2) {
      console.error('GET /api/notifications:', e2.message);
      return res.json([]);
    }
  }
});

// Tài xế
app.get('/api/drivers', async (req, res) => {
  console.log('Request /api/drivers');
  try {
    const [rows] = await pool.query(
      `SELECT id,
              COALESCE(ho_ten, ten, ten_tai_xe) AS ho_ten,
              COALESCE(trang_thai, 'Hoạt động') AS trang_thai,
              email
         FROM taixe`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/drivers primary error:', err.code || err.message);
    // Fallback: maybe only id & ho_ten/ten exists
    try {
      const [basic] = await pool.query(`SELECT id, ho_ten FROM taixe`);
      res.json(basic.map(r => ({ id: r.id, ho_ten: r.ho_ten, trang_thai: 'Hoạt động', email: null })));
    } catch (err2) {
      console.error('GET /api/drivers fallback error:', err2.code || err2.message);
      res.status(200).json([]);
    }
  }
});

// Start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server listening at http://localhost:${PORT}`);
      console.log('DB config:', DB_CONFIG);
    });
  })
  .catch((err) => {
    console.error('Failed to init DB:', err);
    process.exit(1);
  });
