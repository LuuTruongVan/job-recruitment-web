const pool = require("../db");

async function createNotification(userId, title, message, io) {
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
    io.to(`user:${userId}`).emit("newNotification", newNotification);
  }

  return newNotification;
}

// Hàm riêng biệt nếu muốn tách “emit realtime + log”
async function createAndEmitNotification(io, userId, title, message) {
  const newNotification = await createNotification(userId, title, message, io);
  return newNotification;
}

module.exports = { createNotification, createAndEmitNotification };
