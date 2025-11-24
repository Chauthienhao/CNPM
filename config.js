import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Thay đổi nếu cần
  password: '19092005', // Thay đổi nếu cần
  database: 'smartschoolbustest',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', err);
  } else {
    console.log('Kết nối cơ sở dữ liệu thành công!');
  }
});

export default db;