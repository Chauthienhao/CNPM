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
