const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { createNotification } = require("../utils/notifications");

// ==============================
// API: Lấy tất cả thông báo
// ==============================
router.get("/get", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [notifications] = await pool.query(
      `SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC`,
      [decoded.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ==============================
// API: Đánh dấu tất cả đã đọc (đặt trước để tránh xung đột với /read/:id)
// ==============================
router.put("/read/all", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Mark all as read for user_id:", decoded.id); // Log debug

    await pool.query(
      `UPDATE notifications SET is_read=1 WHERE user_id=?`,
      [decoded.id]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking all notifications as read" });
  }
});

// ==============================
// API: Đánh dấu đã đọc thông báo (đặt sau /read/all)
// ==============================
router.put("/read/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const notificationId = req.params.id;
    console.log("Mark as read for id:", notificationId, "user_id:", decoded.id); // Log debug

    await pool.query(
      `UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?`,
      [notificationId, decoded.id]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ message: "Error marking notification" });
  }
});

// ==============================
// API: Tạo thông báo thủ công (Admin)
// ==============================
router.post("/add", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { user_id, title, message } = req.body;

    const newNotification = await createNotification(
      user_id,
      title,
      message,
      req.app.get("io")
    );

    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ message: "Error adding notification" });
  }
});

// ==============================
// API: Gửi thông báo khi Application thay đổi status
// ==============================
router.post("/application-status", async (req, res) => {
  const { application_id, status } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.user_id, jp.title
       FROM applications a
       JOIN jobposts jp ON a.jobpost_id=jp.id
       WHERE a.id=?`,
      [application_id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Application not found" });

    const appData = rows[0];

    const io = req.app.get("io");
    const notification = await createNotification(
      appData.user_id,
      "Cập nhật trạng thái hồ sơ",
      `Hồ sơ ứng tuyển "${appData.title}" đã được cập nhật: ${status}`,
      io
    );

    res.json(notification);
  } catch (error) {
    console.error("Error sending application notification:", error);
    res.status(500).json({ message: "Error sending notification" });
  }
});

// ==============================
// API: Gửi thông báo khi Jobpost thay đổi status
// ==============================
router.post("/jobpost-status", async (req, res) => {
  const { jobpost_id, status } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT jp.id, jp.title, e.user_id
       FROM jobposts jp
       JOIN employers e ON e.id=jp.employer_id
       WHERE jp.id=?`,
      [jobpost_id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Jobpost not found" });

    const jpData = rows[0];

    const io = req.app.get("io");
    const notification = await createNotification(
      jpData.user_id,
      "Cập nhật bài đăng",
      `Bài đăng "${jpData.title}" đã được cập nhật trạng thái: ${status}`,
      io
    );

    res.json(notification);
  } catch (error) {
    console.error("Error sending jobpost notification:", error);
    res.status(500).json({ message: "Error sending notification" });
  }
});

// ==============================
// API: Gửi thông báo khi có Application mới
// ==============================
router.post("/new-application", async (req, res) => {
  const { jobpost_id } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT jp.title, e.user_id
       FROM jobposts jp
       JOIN employers e ON e.id=jp.employer_id
       WHERE jp.id=?`,
      [jobpost_id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Jobpost not found" });

    const info = rows[0];
    const io = req.app.get("io");

    const notification = await createNotification(
      info.user_id,
      "Ứng tuyển mới",
      `Bạn có ứng viên mới ứng tuyển vào công việc "${info.title}"`,
      io
    );

    res.json(notification);
  } catch (error) {
    console.error("Error sending new application notification:", error);
    res.status(500).json({ message: "Error sending notification" });
  }
});

module.exports = router;