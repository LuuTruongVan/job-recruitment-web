import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getToken = () =>
  localStorage.getItem("candidate_token") ||
  localStorage.getItem("employer_token") ||
  localStorage.getItem("admin_token");

const getRole = () =>
  (localStorage.getItem("candidate_token") && "candidate") ||
  (localStorage.getItem("employer_token") && "employer") ||
  (localStorage.getItem("admin_token") && "admin") ||
  null;

const NotificationDropdown = ({ notifications, setNotifications, setUnread }) => {
  const navigate = useNavigate();
  const role = getRole();

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/notifications/read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      setUnread((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:3000/notifications/read/all`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleClick = async (n) => {
    
    await markAsRead(n.id);

   
    if (role === "employer") {
      
      navigate("/manage-posts");
    } else if (role === "candidate") {
  
      navigate("/manage-applications");
    } else if (role === "admin") {
      
      navigate("/admin/manage-job-posts"); 
    }
  };

  return (
    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
      {notifications.length > 0 && (
        <div
          onClick={markAllAsRead}
          style={{
            padding: "10px",
            cursor: "pointer",
            backgroundColor: "#f0f8ff",
            borderBottom: "1px solid #eee",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Đánh dấu tất cả đã đọc
        </div>
      )}
      {notifications.length === 0 ? (
        <div className="text-center p-3">Không có thông báo</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            style={{
              padding: "10px",
              cursor: "pointer",
              backgroundColor: n.is_read ? "#fff" : "#f0f8ff",
              borderBottom: "1px solid #eee",
            }}
          >
            <strong>{n.title}</strong>
            <div style={{ fontSize: "13px", color: "#666" }}>{n.message}</div>
            <small style={{ color: "#888" }}>
              {new Date(n.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationDropdown;