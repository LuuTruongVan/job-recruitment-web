import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileModal from "../component/ProfileModal";
import LoginModal from "../component/auth/LoginModal";
import RegisterModal from "../component/auth/RegisterModal";
import NotificationDropdown from "../component/NotificationsDropdown";
import "../assets/css/Header.css";
import logo from "../assets/img/logo.png";
import { Bell } from "react-bootstrap-icons";
import socket from "../sockets/socket";
import axios from "axios";

const Header = ({ user, handleLogout, setShowChangePassword }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  const getToken = () => {
    return (
      localStorage.getItem("candidate_token") ||
      localStorage.getItem("employer_token") ||
      localStorage.getItem("admin_token")
    );
  };

  const handleLogoutClick = () => {
    handleLogout();
    setMenuOpen(false);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get("http://localhost:3000/notifications/get", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setNotifications(res.data);
        setUnread(res.data.filter((n) => !n.is_read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("joinUser", user.id);

    socket.on("newNotification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnread((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [user]);

  return (
    <header className="header" style={{ zIndex: 1200 }}>
      <div className="header-container">
        {/* Logo */}
        <div
          className="logo-container"
          onClick={() => {
            if (user?.role === "admin") {
              window.location.href = "http://localhost:3001/admin";
            } else {
              navigate("/");
            }
          }}
        >
          <img className="logo" src={logo} alt="Logo" />
        </div>

        {/* Nút menu mobile */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {/* Navbar chính */}
        <div className={`nav-container ${menuOpen ? "active" : ""}`}>
          <div className="nav-links">
            {/* Employer - Đăng tin */}
            {user && user.role === "employer" && (
              <Link
                className="nav-link"
                to="/post-job"
                onClick={() => setMenuOpen(false)}
              >
                Đăng tin
              </Link>
            )}

            {/* Yêu thích */}
            {user && (
              <Link
                className="nav-link"
                to="/favorites"
                onClick={() => setMenuOpen(false)}
              >
                Yêu thích
              </Link>
            )}

            {/* Chat */}
           {/* Chat - Chỉ hiện nếu KHÔNG phải admin */}
{user && user.role !== "admin" && (
  <button
    className="nav-link btn btn-link"
    onClick={() => {
      if (user) navigate("/chat");
      else alert("Bạn cần đăng nhập để chat!");
    }}
  >
    <i className="bi bi-chat-dots"></i> Chat
  </button>
)}


            {/* Icon thông báo */}
            {user && (
              <div className="dropdown" style={{ marginRight: "15px" }}>
                <button
                  className="btn btn-link"
                  id="notification-toggle"
                  style={{ position: "relative" }}
                  data-bs-toggle="dropdown"
                >
                  <Bell size={22} color="#fff" />
                  {unread > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "red",
                        color: "white",
                        borderRadius: "50%",
                        padding: "2px 6px",
                        fontSize: "12px",
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </button>
                <div
                  className="dropdown-menu dropdown-menu-end p-2"
                  style={{
                    width: "320px",
                    zIndex: 1300,
                    position: "absolute",
                  }}
                >
                  <NotificationDropdown
                    notifications={notifications}
                    setNotifications={setNotifications}
                    setUnread={setUnread}
                  />
                </div>
              </div>
            )}

            {/* Dropdown tài khoản */}
            {user ? (
              <div className="dropdown user-dropdown">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="user-avatar"
                  />
                )}
                <button className="dropdown-toggle">
                  {user.role === "candidate"
                    ? user.full_name || "Người dùng"
                    : user.role === "employer"
                    ? user.name || "Công ty"
                    : user.role === "admin"
                    ? user.name || "Admin" // Ưu tiên user.name, nếu không có thì hiển thị "Admin"
                    : "Người dùng"}
                </button>
                <ul className="dropdown-menu">
                  {user.role !== "admin" && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowProfileModal(true);
                          setMenuOpen(false);
                        }}
                      >
                        Xem hồ sơ
                      </button>
                    </li>
                  )}
                  {user.role === "employer" && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/manage-posts"
                        onClick={() => setMenuOpen(false)}
                      >
                        Danh sách bài đăng
                      </Link>
                    </li>
                  )}
                  {user.role === "candidate" && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/manage-applications"
                        onClick={() => setMenuOpen(false)}
                      >
                        Danh sách ứng tuyển
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowChangePassword(true);
                        setMenuOpen(false);
                      }}
                    >
                      Đổi mật khẩu
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogoutClick}>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button
                  className="nav-link btn btn-link"
                  onClick={() => {
                    setShowLoginModal(true);
                    setMenuOpen(false);
                  }}
                >
                  Đăng Nhập
                </button>
                <button
                  className="nav-link btn btn-link"
                  onClick={() => {
                    setShowRegisterModal(true);
                    setMenuOpen(false);
                  }}
                >
                  Đăng Ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Các modal */}
      <ProfileModal show={showProfileModal} onHide={() => setShowProfileModal(false)} />
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onSwitch={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        onSwitch={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </header>
  );
};

export default Header;