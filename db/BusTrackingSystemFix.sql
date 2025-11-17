CREATE DATABASE SmartSchoolBus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SmartSchoolBus;

CREATE TABLE TaiKhoan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE TaiXe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id INT NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    status ENUM('active', 'inactive', 'busy'),
    FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id)
);

CREATE TABLE PhuHuynh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    dia_chi VARCHAR(255)
);

CREATE TABLE HocSinh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phu_huynh_id INT NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status ENUM('Đã đón', 'Chưa đón', 'Nghỉ'),
    FOREIGN KEY (phu_huynh_id) REFERENCES PhuHuynh(id)
);

CREATE TABLE XeBus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bien_so_xe VARCHAR(20) NOT NULL UNIQUE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed INT
);

CREATE TABLE TuyenDuong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_tuyen_duong VARCHAR(255) NOT NULL,
    mo_ta TEXT
);

CREATE TABLE DiemDung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_diem_dung VARCHAR(255) NOT NULL,
    dia_chi TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);

CREATE TABLE LichTrinh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tuyen_duong_id INT NOT NULL,
    tai_xe_id INT NOT NULL,
    xe_bus_id INT NOT NULL,
    hoc_sinh_id INT NOT NULL,
    diem_don_id INT NOT NULL,
    diem_den_id INT NOT NULL,
    gio_xuat_phat TIME NOT NULL,
    FOREIGN KEY (tuyen_duong_id) REFERENCES TuyenDuong(id),
    FOREIGN KEY (tai_xe_id) REFERENCES TaiXe(id),
    FOREIGN KEY (xe_bus_id) REFERENCES XeBus(id),
    FOREIGN KEY (hoc_sinh_id) REFERENCES HocSinh(id),
    FOREIGN KEY (diem_don_id) REFERENCES DiemDung(id),
    FOREIGN KEY (diem_den_id) REFERENCES DiemDung(id)
);

CREATE TABLE ThongBao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phu_huynh_id INT NOT NULL,
    hoc_sinh_id INT NOT NULL,
    noi_dung TEXT NOT NULL,
    FOREIGN KEY (phu_huynh_id) REFERENCES PhuHuynh(id),
    FOREIGN KEY (hoc_sinh_id) REFERENCES HocSinh(id)
);
INSERT INTO TaiKhoan (username, password_hash) VALUES
('admin', '123456'),
('phuhuynh', '123456'),
('taixe', '123456');
INSERT INTO TaiXe (tai_khoan_id, ho_ten, email, so_dien_thoai, status) VALUES
(3, 'Nguyễn Văn Nam', 'nam@gmail.com', '0909123456', 'active'),
(3, 'Phạm Hoàng Long', 'longdriver@gmail.com', '0909888777', 'busy'),
(3, 'Lê Nhật Quang', 'quangdriver@gmail.com', '0909777666', 'inactive'),
(3, 'Võ Thành Đạt', 'datdriver@gmail.com', '0912345678', 'active'),
(3, 'Trần Đức Hòa', 'hoadriver@gmail.com', '0934567890', 'busy'),
(3, 'Phan Ngọc Quý', 'quydriver@gmail.com', '0923344556', 'inactive');
INSERT INTO PhuHuynh (ho_ten, email, so_dien_thoai, dia_chi) VALUES
('Nguyễn Văn Bình', 'binh.ph@gmail.com', '0909123456', '45 Nguyễn Trãi, Q5'),
('Trần Thị Hạnh', 'hanh.ph@gmail.com', '0911222333', '120 Nguyễn Văn Linh, Q7'),
('Lê Minh Dũng', 'dung.ph@gmail.com', '0909111222', '32A Lê Lai, Q1'),
('Phan Thị Mai', 'mai.ph@gmail.com', '0909888999', '200 Nguyễn Thị Minh Khai, Q3'),
('Hoàng Văn Tuấn', 'tuan.ph@gmail.com', '0911222333', '75 Lê Hồng Phong, Q5');
INSERT INTO HocSinh (phu_huynh_id, ho_ten, email, status) VALUES
(1, 'Nguyễn Minh Anh', 'minhanh.hs@gmail.com', 'Chưa đón'),
(1, 'Nguyễn Hoàng Khôi', 'khoi.hs@gmail.com', 'Đã đón'),
(2, 'Trần Gia Bảo', 'giabao.hs@gmail.com', 'Chưa đón'),
(2, 'Trần Ngọc Hà', 'ngochah.hs@gmail.com', 'Nghỉ'),
(2, 'Lê Minh Khang', 'khang.hs@gmail.com', 'Đã đón'),
(2, 'Ngô Bảo Ngọc', 'baongoc.hs@gmail.com', 'Chưa đón'),
(2, 'Phan Anh Tú', 'tu.hs@gmail.com', 'Chưa đón'),
(2, 'Hoàng Bảo An', 'baoan.hs@gmail.com', 'Đã đón'),
(2, 'Nguyễn Nhật Nam', 'nhatnam.hs@gmail.com', 'Nghỉ'),
(2, 'Lê Gia Hưng', 'hung.hs@gmail.com', 'Đã đón');
INSERT INTO XeBus (bien_so_xe, latitude, longitude, speed) VALUES
('51B-12345', 10.762622, 106.660172, 40),
('51C-67890', 10.776530, 106.700981, 0),
('51D-24680', 10.771220, 106.703990, 30),
('51E-13579', 10.775500, 106.675800, 25),
('51F-11223', 10.752300, 106.680500, 35),
('51G-44556', 10.745600, 106.710200, 0),
('51H-77889', 10.769800, 106.702300, 50);
INSERT INTO TuyenDuong (ten_tuyen_duong, mo_ta) VALUES
('Tuyến A: Quận 1 - Quận 5', 'Chạy qua các điểm trường tại trung tâm thành phố'),
('Tuyến B: Quận 7 - Quận 3', 'Chạy qua các khu dân cư và trường tư thục'),
('Tuyến C: Bình Thạnh - Quận 10', 'Dành cho khu vực phía Bắc thành phố'),
('Tuyến D: Gò Vấp - Quận 1', 'Tuyến đường đi qua Phan Văn Trị và Nguyễn Thái Học'),
('Tuyến E: Quận 9 - Quận 2', 'Đưa đón học sinh từ khu công nghệ cao đến Thảo Điền'),
('Tuyến F: Quận 12 - Tân Bình', 'Đưa đón học sinh quanh sân bay Tân Sơn Nhất');
INSERT INTO DiemDung (ten_diem_dung, dia_chi, latitude, longitude) VALUES
('Nhà học sinh Minh Anh', '45 Lý Thường Kiệt, Q5', 10.754200, 106.666300),
('Trường Tiểu học Nguyễn Du', '15 Nguyễn Du, Q1', 10.776890, 106.700980),
('Nhà học sinh Gia Bảo', '80 Nguyễn Văn Linh, Q7', 10.735600, 106.713700),
('Trường THCS Trần Phú', '25 Lê Lai, Q1', 10.771100, 106.698900),
('Nhà học sinh Khôi', '23 Nguyễn Thiện Thuật, Q3', 10.773200, 106.680500);