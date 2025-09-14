const ApplicationsModel = require('../models/applicationsModel');
const pool = require('../db');
const { createNotification, createAndEmitNotification } = require('../utils/notifications');

const ApplicationsServices = {
  async notifyEmployer(io, jobpost_id, candidate_name) {
    const [rows] = await pool.query(
      `SELECT jp.title, e.user_id AS employer_user_id
       FROM jobposts jp 
       JOIN employers e ON e.id = jp.employer_id
       WHERE jp.id = ?`,
      [jobpost_id]
    );

    if (rows.length > 0) {
      const { title, employer_user_id } = rows[0];
      await createAndEmitNotification(io, employer_user_id, 'Ứng tuyển mới', `Ứng viên "${candidate_name}" vừa ứng tuyển công việc "${title}".`);
    }
  },

  async notifyCandidate(io, candidate_user_id, title, status, feedback = null) {
    await createNotification(
      candidate_user_id,
      'Cập nhật trạng thái hồ sơ',
      `Hồ sơ "${title}" đã được cập nhật: ${status}${feedback ? ` (Ghi chú: ${feedback})` : ''}`,
      io
    );
  }
};

module.exports = ApplicationsServices;
