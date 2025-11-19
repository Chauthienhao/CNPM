
-- DATABASE: SmartSchoolBusTest
-- Dữ liệu mẫu đầy đủ để test


DROP DATABASE IF EXISTS SmartSchoolBusTest;
CREATE DATABASE SmartSchoolBusTest;
USE SmartSchoolBusTest;


-- Tạo bảng


CREATE TABLE taikhoan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','parent','driver') NOT NULL
);

CREATE TABLE phuhuynh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id INT NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    dia_chi VARCHAR(255),
    FOREIGN KEY (tai_khoan_id) REFERENCES taikhoan(id)
);

CREATE TABLE hocsinh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phu_huynh_id INT NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status ENUM('Đã đón','Chưa đón','Nghỉ') DEFAULT 'Chưa đón',
    FOREIGN KEY (phu_huynh_id) REFERENCES phuhuynh(id)
);

CREATE TABLE taixe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id INT NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    status ENUM('active','inactive','busy') DEFAULT 'active',
    FOREIGN KEY (tai_khoan_id) REFERENCES taikhoan(id)
);


CREATE TABLE tuyenduong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_tuyen_duong VARCHAR(255) NOT NULL,
    mo_ta TEXT
);

CREATE TABLE xebus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bien_so_xe VARCHAR(20) NOT NULL UNIQUE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed INT,
    status ENUM('available','in_trip','offline','maintenance') DEFAULT 'available',
    tuyen_duong_id INT,
    FOREIGN KEY (tuyen_duong_id) REFERENCES tuyenduong(id)
);

CREATE TABLE logxebus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    xe_bus_id INT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed INT,
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (xe_bus_id) REFERENCES xebus(id)
);

CREATE TABLE diemdung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_diem_dung VARCHAR(255) NOT NULL,
    dia_chi TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);

CREATE TABLE tuyenduong_diemdung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tuyen_duong_id INT NOT NULL,
    diem_dung_id INT NOT NULL,
    thu_tu INT NOT NULL,
    FOREIGN KEY (tuyen_duong_id) REFERENCES tuyenduong(id),
    FOREIGN KEY (diem_dung_id) REFERENCES diemdung(id)
);

CREATE TABLE trip (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tuyen_duong_id INT NOT NULL,
    tai_xe_id INT NOT NULL,
    xe_bus_id INT NOT NULL,
    ngay DATE NOT NULL,
    gio_xuat_phat TIME NOT NULL,
    thu ENUM('2','3','4','5','6','7','CN') NOT NULL,
    FOREIGN KEY (tuyen_duong_id) REFERENCES tuyenduong(id),
    FOREIGN KEY (tai_xe_id) REFERENCES taixe(id),
    FOREIGN KEY (xe_bus_id) REFERENCES xebus(id)
);

CREATE TABLE tripstudent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    hoc_sinh_id INT NOT NULL,
    diem_don_id INT NOT NULL,
    diem_den_id INT NOT NULL,
    thoi_diem_len DATETIME,
    thoi_diem_xuong DATETIME,
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE,
    FOREIGN KEY (hoc_sinh_id) REFERENCES hocsinh(id),
    FOREIGN KEY (diem_don_id) REFERENCES diemdung(id),
    FOREIGN KEY (diem_den_id) REFERENCES diemdung(id)
);

CREATE TABLE thongbao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phu_huynh_id INT NOT NULL,
    hoc_sinh_id INT NOT NULL,
    noi_dung TEXT NOT NULL,
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phu_huynh_id) REFERENCES phuhuynh(id),
    FOREIGN KEY (hoc_sinh_id) REFERENCES hocsinh(id)
);

-- ========================================
-- 2️⃣ Chèn dữ liệu mẫu
-- ========================================

-- Tài khoản
INSERT INTO taikhoan (username, password_hash, role) VALUES
('admin1','hash_admin','admin'),
('parent1','hash_parent1','parent'),
('parent2','hash_parent2','parent'),
('driver1','hash_driver1','driver'),
('driver2','hash_driver2','driver');

-- Phụ huynh
INSERT INTO phuhuynh (tai_khoan_id, ho_ten, email, so_dien_thoai, dia_chi) VALUES
(2,'Nguyen Thi A','a@gmail.com','090900111','Quan 1'),
(3,'Tran Thi B','b@gmail.com','090900222','Quan 3');

-- Học sinh
INSERT INTO hocsinh (phu_huynh_id, ho_ten, email, status) VALUES
(1,'Nguyen Van Minh','minh@gmail.com','Chưa đón'),
(1,'Nguyen Gia Han','han@gmail.com','Chưa đón'),
(2,'Tran Bao Long','long@gmail.com','Chưa đón');

-- Tài xế
INSERT INTO taixe (tai_khoan_id, ho_ten, email, so_dien_thoai, status) VALUES
(4,'Nguyen Van A','taixeA@gmail.com','0901234567','active'),
(5,'Tran Van B','taixeB@gmail.com','0907654321','active');


-- Tuyến đường
INSERT INTO tuyenduong (ten_tuyen_duong, mo_ta) VALUES
('Tuyến A','Bến xe Miền Đông → Bến xe Miền Tây'),
('Tuyến B','Bến Thành → Thủ Đức');

-- Xe bus
INSERT INTO xebus (bien_so_xe, latitude, longitude, speed, status, tuyen_duong_id) VALUES
('51A-12345',10.80100000,106.71460000,0,'available',1),
('51A-67890',10.80250000,106.72110000,0,'available',2);


-- Điểm dừng
INSERT INTO diemdung (ten_diem_dung, dia_chi, latitude, longitude) VALUES
('Bến xe Miền Đông','Quận Bình Thạnh',10.80100000,106.71460000),
('Hàng Xanh','Bình Thạnh',10.80250000,106.72110000),
('Chợ Lớn','Quận 5',10.75070000,106.66700000),
('Bến xe Miền Tây','Bình Tân',10.73210000,106.62800000),
('Bến Thành','Quận 1',10.77200000,106.69830000),
('Thủ Đức','TP. Thủ Đức',10.86940000,106.75320000);

-- Tuyến đường - điểm dừng
INSERT INTO tuyenduong_diemdung (tuyen_duong_id, diem_dung_id, thu_tu) VALUES
(1,1,1),(1,2,2),(1,3,3),(1,4,4),
(2,5,1),(2,2,2),(2,6,3);

-- Trip
INSERT INTO trip (tuyen_duong_id, tai_xe_id, xe_bus_id, ngay, gio_xuat_phat, thu) VALUES
(1,1,1,'2025-11-18','07:00:00','2'),
(1,2,2,'2025-11-18','09:00:00','2'),
(2,1,1,'2025-11-18','08:00:00','2'),
(2,2,2,'2025-11-18','14:00:00','2');

-- TripStudent
INSERT INTO tripstudent (trip_id, hoc_sinh_id, diem_don_id, diem_den_id, thoi_diem_len, thoi_diem_xuong) VALUES
(1,1,1,4,'2025-11-18 07:05:00','2025-11-18 07:30:00'),
(1,2,2,4,'2025-11-18 07:10:00','2025-11-18 07:35:00'),
(3,3,5,6,'2025-11-18 08:10:00','2025-11-18 08:50:00');

-- Log xe bus
INSERT INTO logxebus (xe_bus_id, latitude, longitude, speed, thoi_gian) VALUES
(1,10.80150000,106.71600000,30,'2025-11-18 07:10:00'),
(1,10.80200000,106.71850000,32,'2025-11-18 07:15:00'),
(2,10.77000000,106.69900000,25,'2025-11-18 08:10:00');

-- Thông báo
INSERT INTO thongbao (phu_huynh_id, hoc_sinh_id, noi_dung) VALUES
(1,1,'Học sinh đã lên xe.'),
(1,2,'Học sinh chưa lên xe.'),
(2,3,'Học sinh nghỉ hôm nay.');
