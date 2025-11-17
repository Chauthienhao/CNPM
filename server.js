const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./config');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/bus-location' ,(req,res) => {
  const query = `SELECT * FROM xebus`;

  db.query(query, (err,results) => {
    if (err){
      console.error('Lỗi truy vấn vị trí xe buýt:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu xe buýt.' });
    }
    res.json({
            data: results,
            timestamp: new Date().toISOString()
        });
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

app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên http://localhost:${PORT}`);
});
