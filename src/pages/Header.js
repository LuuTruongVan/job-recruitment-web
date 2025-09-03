import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileModal from "../component/ProfileModal";
import LoginModal from "../component/auth/LoginModal";
import RegisterModal from "../component/auth/RegisterModal";
import NotificationDropdown from "../component/NotificationsDropdown";
import "../assets/css/Header.css";
import logo from "../assets/img/logo.png";
import { Bell, X } from "react-bootstrap-icons"; // Thêm icon X để đóng modal
import socket from "../sockets/socket";
import axios from "axios";

const Header = ({ user, handleLogout, setShowChangePassword }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false); // State mới cho modal thông báo
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const notificationModalRef = useRef(null); // Ref để theo dõi modal thông báo

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

  // Xử lý click ra ngoài để đóng modal thông báo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationModalRef.current &&
        !notificationModalRef.current.contains(event.target) &&
        showNotificationModal
      ) {
        setShowNotificationModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationModal]);

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
        <button className="hamburger" onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        {/* Navbar chính cho desktop */}
        <div className="nav-container">
          <div className="nav-links">
            {user && user.role === "employer" && (
              <Link className="nav-link" to="/post-job">
                Đăng tin
              </Link>
            )}
            {user && user.role !== "admin" && (
              <Link className="nav-link" to="/favorites">
                Yêu thích
              </Link>
            )}
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
                    ? user.name || "Admin"
                    : "Người dùng"}
                </button>
                <ul className="dropdown-menu">
                  {user.role !== "admin" && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setShowProfileModal(true)}
                      >
                        Xem hồ sơ
                      </button>
                    </li>
                  )}
                  {user.role === "employer" && (
                    <li>
                      <Link className="dropdown-item" to="/manage-posts">
                        Danh sách bài đăng
                      </Link>
                    </li>
                  )}
                  {user.role === "candidate" && (
                    <li>
                      <Link className="dropdown-item" to="/manage-applications">
                        Danh sách ứng tuyển
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setShowChangePassword(true)}
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
                  onClick={() => setShowLoginModal(true)}
                >
                  Đăng Nhập
                </button>
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Đăng Ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal menu cho mobile */}
      {menuOpen && (
        <div className="mobile-menu-modal">
          <div className="mobile-menu-content">
            <button className="close-button" onClick={() => setMenuOpen(false)}>
              <X size={30} color="#fff" />
            </button>
            <div className="mobile-nav-links">
              {user && user.role === "employer" && (
                <Link
                  className="mobile-nav-link"
                  to="/post-job"
                  onClick={() => setMenuOpen(false)}
                >
                  Đăng tin
                </Link>
              )}
              {user && user.role !== "admin" && (
                <Link
                  className="mobile-nav-link"
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                >
                  Yêu thích
                </Link>
              )}
              {user && user.role !== "admin" && (
                <button
                  className="mobile-nav-link btn btn-link"
                  onClick={() => {
                    if (user) navigate("/chat");
                    else alert("Bạn cần đăng nhập để chat!");
                    setMenuOpen(false);
                  }}
                >
                  <i className="bi bi-chat-dots"></i> Chat
                </button>
              )}
              {user && (
                <div className="mobile-notification-dropdown">
                  <button
                    className="mobile-nav-link btn btn-link"
                    style={{ position: "relative", width: "80%", textAlign: "center" }}
                    onClick={() => {
                      setShowNotificationModal(true);
                      setMenuOpen(false); // Đóng menu chính khi mở modal thông báo
                    }}
                  >
                    <Bell size={22} color="#000" />
                    {unread > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "20%",
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
                    Thông báo
                  </button>
                </div>
              )}
              {user ? (
                <>
                  {user.role !== "admin" && (
                    <button
                      className="mobile-nav-link"
                      onClick={() => {
                        setShowProfileModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      Xem hồ sơ
                    </button>
                  )}
                  {user.role === "employer" && (
                    <Link
                      className="mobile-nav-link"
                      to="/manage-posts"
                      onClick={() => setMenuOpen(false)}
                    >
                      Danh sách bài đăng
                    </Link>
                  )}
                  {user.role === "candidate" && (
                    <Link
                      className="mobile-nav-link"
                      to="/manage-applications"
                      onClick={() => setMenuOpen(false)}
                    >
                      Danh sách ứng tuyển
                    </Link>
                  )}
                  <button
                    className="mobile-nav-link"
                    onClick={() => {
                      setShowChangePassword(true);
                      setMenuOpen(false);
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    className="mobile-nav-link"
                    onClick={handleLogoutClick}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="mobile-nav-link"
                    onClick={() => {
                      setShowLoginModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    className="mobile-nav-link"
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
      )}

      {/* Modal thông báo cho mobile */}
      {showNotificationModal && user && (
        <div className="notification-modal" ref={notificationModalRef}>
          <div className="notification-modal-content">
            <button
              className="close-button"
              onClick={() => setShowNotificationModal(false)}
            >
              <X size={30} color="#fff" />
            </button>
            <div className="notification-dropdown-container">
              <NotificationDropdown
                notifications={notifications}
                setNotifications={setNotifications}
                setUnread={setUnread}
                onNotificationClick={() => setShowNotificationModal(false)} // Đóng modal khi click vào thông báo
              />
            </div>
          </div>
        </div>
      )}

      {/* Các modal khác */}
      <ProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
      />
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