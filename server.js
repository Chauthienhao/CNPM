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
