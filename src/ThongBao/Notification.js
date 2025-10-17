import React, { useState } from 'react';
import Header from '../Header/Header';
import SideBar from '../LeftSideBar/SideBar';
import './Notification.css';

function ThongBao() {
  const [activeMenu, setActiveMenu] = useState('thongbao');

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  const notifications = [
    {
      id: 1,
      parent: 'Nguyen Van A',
      student: 'Nguyen Van B',
      content: 'Thông báo sự cố: xe bị hư, không đón được học sinh.',
      time: '6:03 PM - 12/10/2025',
    },
    {
      id: 2,
      parent: 'Nguyen Van C',
      student: 'Nguyen Van D',
      content: 'Thông báo: Lịch trình xe trễ 15 phút do kẹt xe.',
      time: '6:05 PM - 12/10/2025',
    },
    {
      id: 3,
      parent: 'Nguyen Van E',
      student: 'Nguyen Van F',
      content: 'Thông báo: Xe đã đón học sinh thành công.',
      time: '6:10 PM - 12/10/2025',
    },
    {
      id: 4,
      parent: 'Nguyen Van G',
      student: 'Nguyen Van H',
      content: 'Xe sắp đến trường, vui lòng chuẩn bị cho học sinh.',
      time: '6:15 PM - 12/10/2025',
    },
    {
      id: 5,
      parent: 'Nguyen Van I',
      student: 'Nguyen Van K',
      content: 'Xe sẽ trễ 10 phút vì trời mưa lớn.',
      time: '6:20 PM - 12/10/2025',
    },
  ];

  const handleReport = () => {
    alert('Báo lỗi');
  };

  const handleSend = () => {
    alert('Đã gửi thông báo đến phụ huynh');
  };

  return (
    <div className="app-wrapper">
      <Header />
      <div className="Main">
        <SideBar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

        {/* Nội dung chính */}
        <div className="thongbao-container">
          <h1 className="thongbao-title">Thông báo</h1>

          <div className="notification-scroll">
            {notifications.map((note) => (
              <div className="notification-card" key={note.id}>
                <p><strong>Phụ huynh:</strong> {note.parent}</p>
                <p><strong>Học sinh:</strong> {note.student}</p>
                <p><strong>Nội dung:</strong> {note.content}</p>
                <small className="notification-time">{note.time}</small>
              </div>
            ))}
          </div>
          
          <div className="notification-actions">
            <button className="report-btn" onClick={handleReport}>Báo lỗi</button>
            <button className="send-btn" onClick={handleSend}>Gửi thông báo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThongBao;
