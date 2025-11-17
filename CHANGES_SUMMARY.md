# Tóm Tắt Các Chỉnh Sửa: Kết Nối Đăng Nhập Với Cơ Sở Dữ Liệu

## Tổng Quan
Đã chuyển đổi phần đăng nhập từ thông tin cố định sang kết nối với cơ sở dữ liệu MySQL (SmartSchoolBus). Bao gồm thêm backend Express.js và cập nhật frontend React để gọi API. Đã thêm validation phía client, thay thế alert bằng Bootstrap alerts, và cải thiện giao diện với FontAwesome icons và CSS hiện đại.

## Các File Đã Chỉnh Sửa / Tạo Mới

### 1. package.json
**Thay đổi:** Thêm dependencies backend và FontAwesome.
- Thêm `"bcryptjs": "^2.4.3"` (dự phòng cho hash mật khẩu, hiện tại chưa dùng vì DB lưu plain text).
- Thêm `"cors": "^2.8.5"` (cho phép CORS từ frontend).
- Thêm `"express": "^4.21.2"` (framework backend).
- Thêm `"mysql2": "^3.11.4"` (kết nối MySQL).
- Thêm `"@fortawesome/fontawesome-free": "^6.5.2"` (icons FontAwesome).

**Hướng dẫn chỉnh sửa:**
- Mở package.json.
- Thêm các dòng trên vào phần "dependencies".
- Chạy `npm install` để cài đặt.

### 2. config.js (File mới)
**Nội dung:** Kết nối cơ sở dữ liệu MySQL.
```javascript
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Thay đổi nếu cần
  password: '', // Thay đổi nếu cần
  database: 'SmartSchoolBus'
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', err);
  } else {
    console.log('Kết nối cơ sở dữ liệu thành công!');
  }
});

module.exports = db;
```

**Hướng dẫn chỉnh sửa:**
- Tạo file config.js ở thư mục gốc.
- Thay đổi host, user, password nếu khác (ví dụ: user khác 'root', password có giá trị).
- Đảm bảo MySQL đang chạy và DB SmartSchoolBus đã tạo (chạy file db/BusTrackingSystem.sql).

### 3. server.js (File mới)
**Nội dung:** Máy chủ Express với endpoint /login.
```javascript
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
```

**Hướng dẫn chỉnh sửa:**
- Tạo file server.js ở thư mục gốc.
- Để chạy: `node server.js`.
- Endpoint: POST /login với body JSON { "username": "admin", "password": "123456" }.
- Lưu ý: Hiện tại so sánh mật khẩu trực tiếp vì DB lưu plain text. Để bảo mật, hash mật khẩu trong DB và dùng bcrypt.compare().

### 4. src/components/Authentication/LoginModal.js
**Thay đổi chính:**
- Thay đổi state từ email sang username.
- Thêm state loading, message, messageType.
- Thêm validation client-side: username không rỗng, password >= 6 ký tự.
- Thay SubmitHandler thành async, gọi fetch đến http://localhost:5000/login.
- Thay alert bằng Bootstrap alerts (success/error).
- Tự động đóng modal sau 1 giây nếu thành công.
- Thêm FontAwesome icons cho labels, buttons, etc.
- Cập nhật structure với overlay.

**Hướng dẫn chỉnh sửa:**
- Mở file LoginModal.js.
- Thay thế phần import và state như trên.
- Thay thế SubmitHandler với validation và API call.
- Thêm message display với alerts.
- Thêm icons và cập nhật structure.

### 5. src/components/Authentication/LoginModal.css
**Thay đổi chính:**
- Thêm overlay với blur background.
- Gradient backgrounds và animations.
- Modern styling với box-shadow, border-radius.
- Hover effects cho buttons.
- Custom alerts styling.
- Responsive design.

**Hướng dẫn chỉnh sửa:**
- Mở file LoginModal.css.
- Thay thế toàn bộ nội dung bằng CSS mới.
- Điều chỉnh colors nếu cần match theme của app.

## Hướng Dẫn Chạy và Kiểm Tra

1. **Cài đặt dependencies:** `npm install`.
2. **Đảm bảo MySQL chạy:** Import db/BusTrackingSystem.sql vào MySQL.
3. **Chạy backend:** `node server.js` (chạy trên port 5000).
4. **Chạy frontend:** `npm start` (React app trên port 3000).
5. **Kiểm tra đăng nhập:**
   - Mở modal đăng nhập.
   - Nhập username: 'admin', password: '123456' (từ dữ liệu mẫu).
   - Nhấn Log In, sẽ hiển thị alert xanh "Đăng nhập thành công!" và tự đóng modal.
   - Test validation: nhập username rỗng hoặc password < 6 ký tự sẽ hiện alert đỏ.

## Lưu Ý 
- **Backend:** Express.js đơn giản cho API. Học cách tạo endpoint, kết nối DB, xử lý lỗi.
- **Frontend:** React hooks (useState), async/await, fetch API, validation.
- **UI/UX:** FontAwesome icons, CSS gradients, animations, responsive design.
- **Bảo mật:** Hiện tại mật khẩu plain text. Học hash với bcrypt: thay `password === user.password_hash` thành `bcrypt.compare(password, user.password_hash)`.
- **CORS:** Đã enable để frontend gọi backend.

## Các Thay Đổi Gần Đây (Khôi Phục và Sửa Lỗi)
- **Sửa lỗi đăng nhập:** Phát hiện lỗi JSON syntax trong request test, nhưng user đã đăng nhập thành công từ frontend. Lỗi có thể do cách gửi request từ terminal trên Windows.
- **Cấu hình DB:** Giữ nguyên config.js với giá trị cố định, không dùng biến môi trường để đơn giản hóa cho người dùng khác.
