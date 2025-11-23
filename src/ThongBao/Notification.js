import React, { useState, useEffect } from 'react';
import './Notification.css';

function ThongBao() {
  const role = localStorage.getItem("role"); // admin / driver / parent


  const [notifications, setNotifications] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newNote, setNewNote] = useState({
    parent_id: '',
    student_id: '',
    content: ''
  });

  const [editNote, setEditNote] = useState({
    id: '',
    parent: '',
    student: '',
    content: ''
  });

  // Load dữ liệu lúc mount
  useEffect(() => {
    fetchNotifications();
    fetchParents();
    fetchStudents(); // để popup sửa có dữ liệu học sinh
  }, []);

  // Fetch danh sách thông báo
  const fetchNotifications = () => {
    fetch('http://localhost:5000/notifications')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setNotifications(data) : setNotifications([]))
      .catch(err => console.error(err));
  };

  // Fetch phụ huynh
  const fetchParents = () => {
    fetch('http://localhost:5000/parents')
      .then(res => res.json())
      .then(data => setParents(data || []))
      .catch(err => console.error(err));
  };

  // Fetch học sinh
  const fetchStudents = (parentId = null) => {
    fetch(`http://localhost:5000/students`)
      .then(res => res.json())
      .then(data => setStudents(data || []))
      .catch(err => console.error(err));
  };

  // ---------- THÊM THÔNG BÁO ----------
  const handleSubmitAdd = () => {
    if (!newNote.parent_id || !newNote.student_id || !newNote.content) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    fetch('http://localhost:5000/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    })
      .then(res => res.json())
      .then(() => {
        fetchNotifications();
        setShowAddModal(false);
        setNewNote({ parent_id: '', student_id: '', content: '' });
      })
      .catch(err => console.error(err));
  };

  // ---------- XÓA THÔNG BÁO ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      await fetch(`http://localhost:5000/notifications/${id}`, {
        method: "DELETE",
      });

      fetchNotifications(); // reload lại UI

    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  // ---------- SỬA THÔNG BÁO ----------
  const handleEdit = (note) => {
    setEditNote({
      id: note.id,
      parent: note.parent,
      student: note.student,
      content: note.content
    });

    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    try {
      await fetch(`http://localhost:5000/notifications/${editNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editNote.content })
      });

      setShowEditModal(false);
      fetchNotifications();

    } catch (error) {
      console.error("Update error:", error);
    }
  };

  //   // gui thong bao
  const handleSendAll = async () => {
    if (!notifications || notifications.length === 0) {
      alert("Không có thông báo để gửi!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/notifications/send-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Gửi thông báo thành công!");
      } else {
        alert("Gửi thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
      alert("Không thể kết nối máy chủ!");
    }
  };


return (
  <div className="app-wrapper">
    <div className="Main">
      <div className="thongbao-container">
        <h1 className="thongbao-title">Thông báo</h1>

        {/* ===================== NÚT THÊM THÔNG BÁO ===================== */}
        {(role === "admin" || role === "driver") && (
          <div className="notification-actions">
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              Thêm thông báo
            </button>
          </div>
        )}

        <div className="notification-scroll">
          {notifications.map((note) => (
            <div className="notification-card" key={note.id}>
              <p><strong>Phụ huynh:</strong> {note.parent}</p>
              <p><strong>Học sinh:</strong> {note.student}</p>
              <p><strong>Nội dung:</strong> {note.content}</p>

              {/* ============= NÚT SỬA + XÓA ============= */}
              {(role === "admin") && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <button className="edit-btn" onClick={() => handleEdit(note)}>
                    Sửa
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                  >
                    Xóa
                  </button>
                </div>
              )}

              {/* DRIVER: Chỉ cho phép SỬA nếu bạn muốn (có thể tắt) */}
              {role === "driver" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {/* Driver KHÔNG ĐƯỢC XÓA */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===================== POPUP THÊM ===================== */}
        {showAddModal && (role === "admin" || role === "driver") && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Thêm thông báo</h2>

              <label>Chọn phụ huynh</label>
              <select
                value={newNote.parent_id}
                onChange={(e) =>
                  setNewNote({ ...newNote, parent_id: e.target.value })
                }
              >
                <option value="">--Chọn phụ huynh--</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ho_ten}
                  </option>
                ))}
              </select>

              <label>Chọn học sinh</label>
              <select
                value={newNote.student_id}
                onChange={(e) =>
                  setNewNote({ ...newNote, student_id: e.target.value })
                }
              >
                <option value="">--Chọn học sinh--</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ho_ten}
                  </option>
                ))}
              </select>

              <label>Nội dung</label>
              <textarea
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
              />

              <div className="modal-actions">
                <button className="add-btn" onClick={handleSubmitAdd}>
                  Thêm
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== POPUP SỬA ===================== */}
        {showEditModal && role === "admin" && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Sửa thông báo</h2>

              <label>Phụ huynh</label>
              <input type="text" value={editNote.parent} disabled />

              <label>Học sinh</label>
              <input type="text" value={editNote.student} disabled />

              <label>Nội dung</label>
              <textarea
                value={editNote.content}
                onChange={(e) =>
                  setEditNote({ ...editNote, content: e.target.value })
                }
              />

              <div className="modal-actions">
                <button className="add-btn" onClick={handleSubmitEdit}>
                  Lưu
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============== NÚT GỬI TẤT CẢ — CHỈ ADMIN + DRIVER ============== */}
        {(role === "admin" || role === "driver") && (
          <div className="notification-actions">
            <button className="send-btn" onClick={handleSendAll}>
              Gửi thông báo
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default ThongBao;