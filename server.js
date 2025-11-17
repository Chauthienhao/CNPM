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
app.put('/api/taixe/:id', (req, res) => {
    const { id } = req.params;
    // Nhận status ở dạng 'active', 'busy', 'inactive' từ frontend
    const { status } = req.body; 

    // Kiểm tra dữ liệu đầu vào
    if (!status || !['active', 'busy', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái cung cấp không hợp lệ.' });
    }

    const query = 'UPDATE taixe SET status = ? WHERE id = ?';

    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài xế.' });
        }

        res.json({ message: `Cập nhật trạng thái thành công cho ID: ${id}` });
    });
});

app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên http://localhost:${PORT}`);
});
