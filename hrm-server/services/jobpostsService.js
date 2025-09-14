// services/jobpostsService.js
const JobpostsModel = require('../models/jobpostsModel');
const { createNotification } = require('../utils/notifications');
const pool = require('../db');

const JobpostsService = {
  createJobPost: async (data, userId, io) => {
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [userId]);
    if (!employer.length) throw new Error('No employer record found for this user');
    const employerId = employer[0].id;
    data.employerId = employerId;

    const insertId = await JobpostsModel.create(data);

    // Gửi thông báo cho admin
    const [admins] = await pool.query('SELECT id FROM users WHERE role = ?', ['admin']);
    if (admins.length > 0) {
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "Bài đăng mới",
          `Có bài đăng mới với tiêu đề "${data.title}" từ ${data.company_name || 'một nhà tuyển dụng'}.`,
          io
        );
      }
    }

    return insertId;
  },

  updateJobPost: async (id, data, userId) => {
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [userId]);
    if (!employer.length) throw new Error('No employer record found for this user');
    const employerId = employer[0].id;

    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (!job.length) throw new Error('Unauthorized or job not found');

    return JobpostsModel.update(id, data);
  },

  deleteJobPost: async (id, userId) => {
    const [employer] = await pool.query('SELECT id FROM employers WHERE user_id = ?', [userId]);
    if (!employer.length) throw new Error('No employer record found for this user');
    const employerId = employer[0].id;

    const [job] = await pool.query('SELECT * FROM jobposts WHERE id = ? AND employer_id = ?', [id, employerId]);
    if (!job.length) throw new Error('Unauthorized or job not found');

    return JobpostsModel.delete(id);
  }
};

module.exports = JobpostsService;
