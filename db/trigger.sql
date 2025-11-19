-- =========================

-- TRIGGERS FOR SmartSchoolBus

-- =========================



DELIMITER //



-- 1️⃣ Trigger tự động điền THU khi thêm Trip

CREATE TRIGGER trip_before_insert

BEFORE INSERT ON trip

FOR EACH ROW

BEGIN

    SET NEW.thu = CASE DAYOFWEEK(NEW.ngay)

        WHEN 1 THEN 'CN'

        WHEN 2 THEN '2'

        WHEN 3 THEN '3'

        WHEN 4 THEN '4'

        WHEN 5 THEN '5'

        WHEN 6 THEN '6'

        WHEN 7 THEN '7'

    END;

END;

//



CREATE TRIGGER trip_before_update

BEFORE UPDATE ON trip

FOR EACH ROW

BEGIN

    SET NEW.thu = CASE DAYOFWEEK(NEW.ngay)

        WHEN 1 THEN 'CN'

        WHEN 2 THEN '2'

        WHEN 3 THEN '3'

        WHEN 4 THEN '4'

        WHEN 5 THEN '5'

        WHEN 6 THEN '6'

        WHEN 7 THEN '7'

    END;

END;

//



-- 2️⃣ Trigger cập nhật trạng thái HocSinh khi TripStudent thay đổi

CREATE TRIGGER tripstudent_after_update

AFTER UPDATE ON tripstudent

FOR EACH ROW

BEGIN

    -- Học sinh lên xe

    IF NEW.thoi_diem_len IS NOT NULL AND OLD.thoi_diem_len IS NULL THEN

        UPDATE hocsinh 

        SET status = 'Đã đón' 

        WHERE id = NEW.hoc_sinh_id;

    END IF;

    

    -- Học sinh xuống xe

    IF NEW.thoi_diem_xuong IS NOT NULL AND OLD.thoi_diem_xuong IS NULL THEN

        UPDATE hocsinh 

        SET status = 'Chưa đón' 

        WHERE id = NEW.hoc_sinh_id;

    END IF;

END;

//



-- 3️⃣ Trigger ghi log vị trí XeBus khi cập nhật

CREATE TRIGGER xebus_after_update

AFTER UPDATE ON xebus

FOR EACH ROW

BEGIN

    IF OLD.latitude <> NEW.latitude OR OLD.longitude <> NEW.longitude OR OLD.speed <> NEW.speed THEN

        INSERT INTO logxebus(xe_bus_id, latitude, longitude, speed) 

        VALUES (NEW.id, NEW.latitude, NEW.longitude, NEW.speed);

    END IF;

END;

//





-- 4️⃣ Trigger tự động thông báo khi học sinh chưa lên xe đúng giờ
DELIMITER //

DELIMITER //

CREATE TRIGGER tripstudent_after_insert
AFTER INSERT ON tripstudent
FOR EACH ROW
BEGIN
    DECLARE gio_xuat DATETIME;

    -- Lấy giờ xuất phát từ bảng trip
    SELECT t.gio_xuat_phat 
    INTO gio_xuat
    FROM trip t
    WHERE t.id = NEW.trip_id;

    -- Nếu học sinh chưa lên xe mà đã quá giờ xuất phát 5 phút
    IF NEW.thoi_diem_len IS NULL 
       AND NEW.thoi_diem_xuong IS NULL
       AND NOW() > DATE_ADD(gio_xuat, INTERVAL 5 MINUTE) THEN
        INSERT INTO thongbao(phu_huynh_id, hoc_sinh_id, noi_dung)
        SELECT h.phu_huynh_id, h.id, 
               CONCAT('Học sinh ', h.ho_ten, ' chưa lên xe đúng giờ.')
        FROM hocsinh h
        WHERE h.id = NEW.hoc_sinh_id;
    END IF;
END;
//

DELIMITER ;



DELIMITER ;