// services/notificationsService.js
const NotificationsModel = require("../models/notificationsModel");
const { createNotification } = require("../utils/notifications");

const NotificationsService = {
  getUserNotifications: async (userId) => {
    const [rows] = await NotificationsModel.getByUserId(userId);
    return rows;
  },

  markAllAsRead: async (userId) => {
    await NotificationsModel.markAllAsRead(userId);
    return { message: "All notifications marked as read" };
  },

  markAsRead: async (id, userId) => {
    await NotificationsModel.markAsRead(id, userId);
    return { message: "Notification marked as read" };
  },

  addNotification: async (userId, title, message, io) => {
    const notification = await createNotification(userId, title, message, io);
    return notification;
  },

  notifyApplicationStatus: async (applicationId, status, io) => {
    const [rows] = await NotificationsModel.getApplicationInfo(applicationId);

    if (!rows.length) throw new Error("Application not found");
    const appData = rows[0];

    return await createNotification(
      appData.user_id,
      "Cập nhật trạng thái hồ sơ",
      `Hồ sơ ứng tuyển "${appData.title}" đã được cập nhật: ${status}`,
      io
    );
  },

  notifyJobpostStatus: async (jobpostId, status, io) => {
    const [rows] = await NotificationsModel.getJobpostInfo(jobpostId);

    if (!rows.length) throw new Error("Jobpost not found");
    const jpData = rows[0];

    return await createNotification(
      jpData.user_id,
      "Cập nhật bài đăng",
      `Bài đăng "${jpData.title}" đã được cập nhật trạng thái: ${status}`,
      io
    );
  },

  notifyNewApplication: async (jobpostId, io) => {
    const [rows] = await NotificationsModel.getJobpostInfo(jobpostId);

    if (!rows.length) throw new Error("Jobpost not found");
    const info = rows[0];

    return await createNotification(
      info.user_id,
      "Ứng tuyển mới",
      `Bạn có ứng viên mới ứng tuyển vào công việc "${info.title}"`,
      io
    );
  }
};

module.exports = NotificationsService;
