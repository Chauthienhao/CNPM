const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Thay đổi nếu cần
  password: '1234', // Thay đổi nếu cần
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
