const pool = require("../db");

// Hàm tạo thông báo + realtime (export để reuse)
async function createNotification(userId, title, message, io) {
  try {
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, NOW())`,
      [userId, title, message]
    );

    const newNotification = {
      id: result.insertId,
      user_id: userId,
      title,
      message,
      is_read: 0,
      created_at: new Date(),
    };

    if (io) {
      console.log(`🔔 Emitting newNotification to user:${userId}`, newNotification);
      io.to(`user:${userId}`).emit("newNotification", newNotification);  // Thay event thành "newNotification"
    }

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

module.exports = { createNotification };