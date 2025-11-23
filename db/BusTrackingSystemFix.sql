-- ============================================================
-- 1. KHỞI TẠO DATABASE VÀ BẢNG
-- ============================================================
DROP DATABASE IF EXISTS SmartSchoolBusTest;
CREATE DATABASE SmartSchoolBusTest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SmartSchoolBusTest;

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

-- ============================================================
-- 2. NẠP DỮ LIỆU MẪU (REALISTIC DATA)
-- ============================================================

-- 2.1. Tài khoản (Khoảng 30 user: 2 Admin, 5 Tài xế, 23 Phụ huynh)
INSERT INTO taikhoan (username, password_hash, role) VALUES
-- Admin
('admin1','hash_admin','admin'),
('admin_main', '$2b$10$UpswdHash1', 'admin'),
('admin_support', '$2b$10$UpswdHash2', 'admin'),
-- Tài xế (ID 3 -> 7)
('driver_tuan', '$2b$10$UpswdHash3', 'driver'),
('driver_hung', '$2b$10$UpswdHash4', 'driver'),
('driver_nam', '$2b$10$UpswdHash5', 'driver'),
('driver_hai', '$2b$10$UpswdHash6', 'driver'),
('driver_dung', '$2b$10$UpswdHash7', 'driver'),
-- Phụ huynh (ID 8 -> 30)
('ph_minhkhoi', '$2b$10$UpswdHash8', 'parent'),
('ph_baocchau', '$2b$10$UpswdHash9', 'parent'),
('ph_quanganh', '$2b$10$UpswdHash10', 'parent'),
('ph_thuytien', '$2b$10$UpswdHash11', 'parent'),
('ph_hoanglam', '$2b$10$UpswdHash12', 'parent'),
('ph_khanhvy', '$2b$10$UpswdHash13', 'parent'),
('ph_trungkien', '$2b$10$UpswdHash14', 'parent'),
('ph_thanhha', '$2b$10$UpswdHash15', 'parent'),
('ph_duyphuoc', '$2b$10$UpswdHash16', 'parent'),
('ph_ngocmai', '$2b$10$UpswdHash17', 'parent'),
('ph_tanphat', '$2b$10$UpswdHash18', 'parent'),
('ph_kimngan', '$2b$10$UpswdHash19', 'parent'),
('ph_huuphuoc', '$2b$10$UpswdHash20', 'parent'),
('ph_camtu', '$2b$10$UpswdHash21', 'parent'),
('ph_vannam', '$2b$10$UpswdHash22', 'parent'),
('ph_minhthu', '$2b$10$UpswdHash23', 'parent'),
('ph_quocbao', '$2b$10$UpswdHash24', 'parent'),
('ph_thanhhang', '$2b$10$UpswdHash25', 'parent'),
('ph_ducminh', '$2b$10$UpswdHash26', 'parent'),
('ph_phuongthao', '$2b$10$UpswdHash27', 'parent'),
('ph_anhkhoa', '$2b$10$UpswdHash28', 'parent'),
('ph_mylinh', '$2b$10$UpswdHash29', 'parent'),
('ph_hoangan', '$2b$10$UpswdHash30', 'parent');

-- 2.2. Tài xế (Liên kết với taikhoan ID 3 -> 7)
INSERT INTO taixe (tai_khoan_id, ho_ten, email, so_dien_thoai, status) VALUES
(3, 'Nguyễn Anh Tuấn', 'tuan.driver@bus.com', '0909123456', 'active'),
(4, 'Trần Văn Hùng', 'hung.tran@bus.com', '0918123789', 'active'),
(5, 'Lê Hoàng Nam', 'nam.le@bus.com', '0988776655', 'active'),
(6, 'Phạm Thanh Hải', 'hai.pham@bus.com', '0933445566', 'busy'),
(7, 'Võ Tiến Dũng', 'dung.vo@bus.com', '0977889900', 'inactive');

-- 2.3. Phụ huynh (Liên kết với taikhoan ID 8 -> 30) - Địa chỉ thực tế HCM
INSERT INTO phuhuynh (tai_khoan_id, ho_ten, email, so_dien_thoai, dia_chi) VALUES
(8, 'Trần Minh Khôi', 'khoi.tm@gmail.com', '0901000001', '123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM'),
(9, 'Lê Bảo Châu', 'chau.lb@gmail.com', '0901000002', '45 Lê Thánh Tôn, Quận 1, TP.HCM'),
(10, 'Phạm Quang Anh', 'anh.pq@gmail.com', '0901000003', '88 Cách Mạng Tháng 8, Quận 3, TP.HCM'),
(11, 'Nguyễn Thủy Tiên', 'tien.nt@gmail.com', '0901000004', '202 Phạm Văn Đồng, TP. Thủ Đức'),
(12, 'Hoàng Văn Lâm', 'lam.hv@gmail.com', '0901000005', '15 Trần Hưng Đạo, Quận 5, TP.HCM'),
(13, 'Đỗ Khánh Vy', 'vy.dk@gmail.com', '0901000006', 'Sunrise City, Quận 7, TP.HCM'),
(14, 'Vũ Trung Kiên', 'kien.vt@gmail.com', '0901000007', 'Vinhomes Central Park, Bình Thạnh, TP.HCM'),
(15, 'Bùi Thanh Hà', 'ha.bt@gmail.com', '0901000008', 'Landmark 81, Bình Thạnh, TP.HCM'),
(16, 'Lý Duy Phước', 'phuoc.ld@gmail.com', '0901000009', '12 Quang Trung, Gò Vấp, TP.HCM'),
(17, 'Hồ Ngọc Mai', 'mai.hn@gmail.com', '0901000010', 'Masteri Thảo Điền, TP. Thủ Đức'),
(18, 'Đặng Tấn Phát', 'phat.dt@gmail.com', '0901000011', 'Crescent Mall, Quận 7, TP.HCM'),
(19, 'Dương Kim Ngân', 'ngan.dk@gmail.com', '0901000012', 'Aeon Mall Tân Phú, Tân Phú, TP.HCM'),
(20, 'Cao Hữu Phước', 'phuoc.ch@gmail.com', '0901000013', 'Sân Bay Tân Sơn Nhất, Tân Bình, TP.HCM'),
(21, 'Ngô Cẩm Tú', 'tu.nc@gmail.com', '0901000014', 'Đầm Sen, Quận 11, TP.HCM'),
(22, 'Trương Văn Nam', 'nam.tv@gmail.com', '0901000015', 'Bến xe Miền Đông, Bình Thạnh, TP.HCM'),
(23, 'Vương Minh Thư', 'thu.vm@gmail.com', '0901000016', 'Bến xe Miền Tây, Bình Tân, TP.HCM'),
(24, 'Đinh Quốc Bảo', 'bao.dq@gmail.com', '0901000017', 'Thảo Cầm Viên, Quận 1, TP.HCM'),
(25, 'Phan Thanh Hằng', 'hang.pt@gmail.com', '0901000018', 'Chợ Bến Thành, Quận 1, TP.HCM'),
(26, 'Lâm Đức Minh', 'minh.ld@gmail.com', '0901000019', 'Khu Công Nghệ Cao, TP. Thủ Đức'),
(27, 'Trịnh Phương Thảo', 'thao.tp@gmail.com', '0901000020', 'Đại học Bách Khoa, Quận 10, TP.HCM'),
(28, 'Mạc Anh Khoa', 'khoa.ma@gmail.com', '0901000021', 'Hồ Con Rùa, Quận 3, TP.HCM'),
(29, 'Châu Mỹ Linh', 'linh.cm@gmail.com', '0901000022', 'Bitexco Tower, Quận 1, TP.HCM'),
(30, 'La Hoàng An', 'an.lh@gmail.com', '0901000023', 'Coopmart Rạch Miễu, Phú Nhuận, TP.HCM');

-- 2.4. Học sinh (25 bé, liên kết với ID Phụ huynh tương ứng)
INSERT INTO hocsinh (phu_huynh_id, ho_ten, email, status) VALUES
(1, 'Trần Gia Huy', 'huy.tg@school.edu.vn', 'Chưa đón'),
(2, 'Lê Ngọc Diệp', 'diep.ln@school.edu.vn', 'Đã đón'),
(3, 'Phạm Minh Quân', 'quan.pm@school.edu.vn', 'Chưa đón'),
(4, 'Nguyễn Thảo Nhi', 'nhi.nt@school.edu.vn', 'Nghỉ'),
(5, 'Hoàng Gia Bảo', 'bao.hg@school.edu.vn', 'Chưa đón'),
(6, 'Đỗ Tường Vy', 'vy.dt@school.edu.vn', 'Đã đón'),
(7, 'Vũ Tuấn Kiệt', 'kiet.vt@school.edu.vn', 'Chưa đón'),
(8, 'Bùi Hà My', 'my.bh@school.edu.vn', 'Chưa đón'),
(9, 'Lý Thiên Phúc', 'phuc.lt@school.edu.vn', 'Chưa đón'),
(10, 'Hồ Lan Anh', 'anh.hl@school.edu.vn', 'Đã đón'),
(11, 'Đặng Minh Triết', 'triet.dm@school.edu.vn', 'Chưa đón'),
(12, 'Dương Thảo Vy', 'vy.dt2@school.edu.vn', 'Nghỉ'),
(13, 'Cao Hữu Tín', 'tin.ch@school.edu.vn', 'Chưa đón'),
(14, 'Ngô Thanh Trúc', 'truc.nt@school.edu.vn', 'Đã đón'),
(15, 'Trương Gia Hưng', 'hung.tg@school.edu.vn', 'Chưa đón'),
(16, 'Vương Anh Thư', 'thu.va@school.edu.vn', 'Chưa đón'),
(17, 'Đinh Quốc Khánh', 'khanh.dq@school.edu.vn', 'Đã đón'),
(18, 'Phan Minh Hằng', 'hang.pm@school.edu.vn', 'Chưa đón'),
(19, 'Lâm Trí Dũng', 'dung.lt@school.edu.vn', 'Nghỉ'),
(20, 'Trịnh Minh Thư', 'thu.tm@school.edu.vn', 'Chưa đón'),
(21, 'Mạc Đăng Khoa', 'khoa.md@school.edu.vn', 'Chưa đón'),
(22, 'Châu Gia Linh', 'linh.cg@school.edu.vn', 'Đã đón'),
(23, 'La Minh An', 'an.lm@school.edu.vn', 'Chưa đón'),
(1, 'Trần Gia Hân', 'han.tg@school.edu.vn', 'Chưa đón'), -- Phụ huynh 1 có 2 con
(5, 'Hoàng Bảo Ngọc', 'ngoc.hb@school.edu.vn', 'Đã đón'); -- Phụ huynh 5 có 2 con

-- 2.5. Tuyến đường (5 Tuyến chính tại HCM)
INSERT INTO tuyenduong (ten_tuyen_duong, mo_ta) VALUES
('Tuyến 1: Q7 -> Q1', 'Đón học sinh từ khu Sunrise/Phú Mỹ Hưng về trường tại Quận 1'),
('Tuyến 2: Thủ Đức -> Bình Thạnh', 'Đón từ Vinhomes Grand Park, Masteri về trường Bình Thạnh'),
('Tuyến 3: Gò Vấp -> Phú Nhuận', 'Đón từ Quang Trung, Phan Văn Trị về trường Phú Nhuận'),
('Tuyến 4: Bình Tân -> Q5', 'Tuyến miền Tây, đón từ Tên Lửa về trường Quận 5'),
('Tuyến 5: Q2 -> Q1', 'Đón từ Thảo Điền qua cầu Sài Gòn về Quận 1');

-- 2.6. Xe Bus (5 xe, biển số thực tế)
INSERT INTO xebus (bien_so_xe, latitude, longitude, speed, status, tuyen_duong_id) VALUES
('51B-123.45', 10.72960000, 106.72140000, 35, 'in_trip', 1),    -- Đang ở Q7
('59G-567.89', 10.84000000, 106.81000000, 40, 'in_trip', 2),    -- Đang ở Thủ Đức
('51B-999.88', 10.83000000, 106.66000000, 0, 'available', 3),   -- Đang chờ ở Gò Vấp
('50F-111.22', 10.75000000, 106.60000000, 0, 'maintenance', 4), -- Bảo trì
('51B-333.44', 10.80000000, 106.74000000, 25, 'in_trip', 5);    -- Đang chạy ở Q2

-- 2.7. Điểm dừng (Các địa danh nổi tiếng HCM có tọa độ thực)
INSERT INTO diemdung (ten_diem_dung, dia_chi, latitude, longitude) VALUES
-- Tuyến 1
('Sunrise City North', '27 Nguyễn Hữu Thọ, Q7', 10.738000, 106.699000),
('Lotte Mart Q7', '469 Nguyễn Hữu Thọ, Q7', 10.735000, 106.700000),
('Đại học Tôn Đức Thắng', '19 Nguyễn Hữu Thọ, Q7', 10.732000, 106.698000),
('Trường THPT Lê Hồng Phong', '235 Nguyễn Văn Cừ, Q5', 10.760000, 106.682000), -- Điểm đến Tuyến 1

-- Tuyến 2
('Vinhomes Grand Park', 'Nguyễn Xiển, TP Thủ Đức', 10.838000, 106.833000),
('Khu Công Nghệ Cao', 'Xa Lộ Hà Nội, TP Thủ Đức', 10.855000, 106.785000),
('Ngã 4 Thủ Đức', 'Võ Văn Ngân, TP Thủ Đức', 10.850000, 106.772000),
('Trường Quốc Tế Á Châu', 'Văn Thánh, Bình Thạnh', 10.798000, 106.719000), -- Điểm đến Tuyến 2

-- Tuyến 3
('Emart Gò Vấp', '366 Phan Văn Trị, Gò Vấp', 10.822000, 106.693000),
('Công viên Gia Định', 'Hoàng Minh Giám, Gò Vấp', 10.810000, 106.680000),
('Trường THPT Phú Nhuận', '5 Hoàng Minh Giám, Phú Nhuận', 10.805000, 106.678000); -- Điểm đến Tuyến 3

-- 2.8. Liên kết Tuyến - Điểm dừng
INSERT INTO tuyenduong_diemdung (tuyen_duong_id, diem_dung_id, thu_tu) VALUES
-- Tuyến 1
(1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4),
-- Tuyến 2
(2, 5, 1), (2, 6, 2), (2, 7, 3), (2, 8, 4),
-- Tuyến 3
(3, 9, 1), (3, 10, 2), (3, 11, 3);

-- 2.9. Trip (Các chuyến xe chạy ngày hôm nay)
INSERT INTO trip (tuyen_duong_id, tai_xe_id, xe_bus_id, ngay, gio_xuat_phat, thu) VALUES
(1, 1, 1, CURRENT_DATE(), '06:30:00', '4'), -- Tài xế Tuấn, Xe 51B-123.45, Tuyến 1
(2, 2, 2, CURRENT_DATE(), '06:15:00', '4'), -- Tài xế Hùng, Xe 59G-567.89, Tuyến 2
(3, 3, 3, CURRENT_DATE(), '06:45:00', '4'), -- Tài xế Nam, Xe 51B-999.88, Tuyến 3
(1, 1, 1, CURRENT_DATE(), '16:30:00', '4'); -- Chuyến chiều Tuyến 1

-- 2.10. TripStudent (Điểm danh học sinh lên xuống xe)
INSERT INTO tripstudent (trip_id, hoc_sinh_id, diem_don_id, diem_den_id, thoi_diem_len, thoi_diem_xuong) VALUES
-- Trip 1 (Sáng Tuyến 1)
(1, 1, 1, 4, '2025-11-20 06:35:00', NULL), -- Gia Huy lên tại Sunrise, chưa xuống
(1, 2, 2, 4, '2025-11-20 06:45:00', NULL), -- Ngọc Diệp lên tại Lotte
(1, 3, 3, 4, NULL, NULL),              -- Minh Quân chưa lên xe (đang chờ)

-- Trip 2 (Sáng Tuyến 2)
(2, 6, 5, 8, '2025-11-20 06:20:00', '2025-11-20 07:15:00'), -- Tường Vy đã hoàn thành chuyến
(2, 7, 6, 8, '2025-11-20 06:30:00', NULL);                  -- Tuấn Kiệt đang trên xe

-- 2.11. Thông báo
INSERT INTO thongbao (phu_huynh_id, hoc_sinh_id, noi_dung) VALUES
(1, 1, 'Bé Gia Huy đã lên xe tại Sunrise City lúc 06:35.'),
(2, 2, 'Bé Ngọc Diệp đã lên xe tại Lotte Mart lúc 06:45.'),
(6, 6, 'Bé Tường Vy đã đến trường an toàn lúc 07:15.'),
(4, 4, 'Thông báo: Bé Thảo Nhi xin nghỉ học hôm nay.');

-- 2.12. Log Xe Bus (Dữ liệu hành trình để vẽ đường đi)
INSERT INTO logxebus (xe_bus_id, latitude, longitude, speed, thoi_gian) VALUES
-- Xe 1 (Tuyến 1) di chuyển từ Sunrise về Q1
(1, 10.738000, 106.699000, 30, '2025-11-20 06:35:00'),
(1, 10.736000, 106.699500, 35, '2025-11-20 06:40:00'),
(1, 10.735000, 106.700000, 20, '2025-11-20 06:45:00'), -- Đón tại Lotte
(1, 10.745000, 106.695000, 40, '2025-11-20 06:55:00'),
-- Xe 2 (Tuyến 2) di chuyển
(2, 10.838000, 106.833000, 30, '2025-11-20 06:20:00'),
(2, 10.845000, 106.810000, 45, '2025-11-20 06:25:00');