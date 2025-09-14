// controllers/notificationsController.js
const jwt = require("jsonwebtoken");
const NotificationsService = require("../services/notificationsService");

const NotificationsController = {
  // Lấy tất cả thông báo
  getNotifications: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const notifications = await NotificationsService.getUserNotifications(decoded.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await NotificationsService.markAllAsRead(decoded.id);
      res.json(result);
    } catch (error) {
      console.error("Error marking all notifications:", error);
      res.status(500).json({ message: "Error marking all notifications as read" });
    }
  },

  // Đánh dấu 1 thông báo đã đọc
  markAsRead: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const notificationId = req.params.id;
      const result = await NotificationsService.markAsRead(notificationId, decoded.id);
      res.json(result);
    } catch (error) {
      console.error("Error marking notification:", error);
      res.status(500).json({ message: "Error marking notification" });
    }
  },

  // Tạo thông báo thủ công (Admin)
  addNotification: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin")
        return res.status(403).json({ message: "Access denied" });

      const { user_id, title, message } = req.body;
      const newNotification = await NotificationsService.addNotification(
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
  },

  // Gửi thông báo khi Application đổi trạng thái
  notifyApplicationStatus: async (req, res) => {
    const { application_id, status } = req.body;
    try {
      const notification = await NotificationsService.notifyApplicationStatus(
        application_id,
        status,
        req.app.get("io")
      );
      res.json(notification);
    } catch (error) {
      console.error("Error sending application notification:", error);
      res.status(500).json({ message: "Error sending notification" });
    }
  },

  // Gửi thông báo khi Jobpost đổi trạng thái
  notifyJobpostStatus: async (req, res) => {
    const { jobpost_id, status } = req.body;
    try {
      const notification = await NotificationsService.notifyJobpostStatus(
        jobpost_id,
        status,
        req.app.get("io")
      );
      res.json(notification);
    } catch (error) {
      console.error("Error sending jobpost notification:", error);
      res.status(500).json({ message: "Error sending notification" });
    }
  },

  // Gửi thông báo khi có Application mới
  notifyNewApplication: async (req, res) => {
    const { jobpost_id } = req.body;
    try {
      const notification = await NotificationsService.notifyNewApplication(
        jobpost_id,
        req.app.get("io")
      );
      res.json(notification);
    } catch (error) {
      console.error("Error sending new application notification:", error);
      res.status(500).json({ message: "Error sending notification" });
    }
  }
};

module.exports = NotificationsController;
