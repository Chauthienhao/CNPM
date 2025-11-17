import React, { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';
import './Notification.css';

function ThongBao() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getNotifications();
        if (mounted) setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError('Không tải được thông báo');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleReport = () => {
    alert('Báo lỗi');
  };

  const handleSend = () => {
    alert('Đã gửi thông báo đến phụ huynh');
  };

  return (
    <div className="app-wrapper">
      <div className="Main">
        <div className="thongbao-container">
          <h1 className="thongbao-title">Thông báo</h1>

          {loading && <div style={{padding: 12}}>Đang tải...</div>}
          {error && !loading && <div style={{color: 'red', padding: 12}}>{error}</div>}

          {!loading && !error && (
            <div className="notification-scroll">
              {notifications.map((note) => (
                <div className="notification-card" key={note.id}>
                  <p><strong>Phụ huynh:</strong> {note.phu_huynh || '—'}</p>
                  <p><strong>Học sinh:</strong> {note.hoc_sinh || '—'}</p>
                  <p><strong>Nội dung:</strong> {note.noi_dung || '—'}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{padding: 12, textAlign: 'center'}}>Không có thông báo</div>
              )}
            </div>
          )}
          
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
