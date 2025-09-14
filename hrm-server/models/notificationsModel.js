// models/notificationsModel.js
const pool = require("../db");

const NotificationsModel = {
  // Lấy thông báo theo user_id
  getByUserId: (userId) => {
    return pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: (userId) => {
    return pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );
  },

  // Đánh dấu 1 thông báo đã đọc
  markAsRead: (id, userId) => {
    return pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  },

  // Tạo thông báo mới
  create: (userId, title, message) => {
    return pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES (?, ?, ?, 0, NOW())`,
      [userId, title, message]
    );
  },

  // Lấy application + job title
  getApplicationInfo: (applicationId) => {
    return pool.query(
      `SELECT a.id, a.user_id, jp.title
       FROM applications a
       JOIN jobposts jp ON a.jobpost_id = jp.id
       WHERE a.id = ?`,
      [applicationId]
    );
  },

  // Lấy jobpost + employer user_id
  getJobpostInfo: (jobpostId) => {
    return pool.query(
      `SELECT jp.id, jp.title, e.user_id
       FROM jobposts jp
       JOIN employers e ON e.id = jp.employer_id
       WHERE jp.id = ?`,
      [jobpostId]
    );
  }
};

module.exports = NotificationsModel;
