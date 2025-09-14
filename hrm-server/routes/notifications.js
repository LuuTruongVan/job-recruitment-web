// routes/notifications.js
const express = require("express");
const router = express.Router();
const NotificationsController = require("../controllers/notificationsController");

// Lấy tất cả thông báo
router.get("/get", NotificationsController.getNotifications);

// Đánh dấu tất cả đã đọc
router.put("/read/all", NotificationsController.markAllAsRead);

// Đánh dấu 1 thông báo đã đọc
router.put("/read/:id", NotificationsController.markAsRead);

// Tạo thông báo thủ công (Admin)
router.post("/add", NotificationsController.addNotification);

// Gửi thông báo khi Application đổi trạng thái
router.post("/application-status", NotificationsController.notifyApplicationStatus);

// Gửi thông báo khi Jobpost đổi trạng thái
router.post("/jobpost-status", NotificationsController.notifyJobpostStatus);

// Gửi thông báo khi có Application mới
router.post("/new-application", NotificationsController.notifyNewApplication);

module.exports = router;
