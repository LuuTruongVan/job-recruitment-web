const pool = require('../db');

const ApplicationsModel = {
  async createApplication(data) {
    const { jobpost_id, user_id, candidate_name, phone, email, address, skills, introduction, cvPath } = data;
    const [result] = await pool.query(
      `INSERT INTO applications 
        (jobpost_id, user_id, candidate_name, phone, email, address, skills, introduction, cv_path, status, applied_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [jobpost_id, user_id, candidate_name, phone, email, address, skills, introduction, cvPath]
    );
    return result.insertId;
  },

  async getApplicationsByUser(userId) {
    const [applications] = await pool.query(
      `SELECT a.*, j.title 
       FROM applications a 
       JOIN jobposts j ON a.jobpost_id = j.id 
       WHERE a.user_id = ? 
       ORDER BY a.applied_at DESC`,
      [userId]
    );
    return applications;
  },

  async getApplicationById(id) {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
    return rows[0];
  },

  // ✅ Bỏ feedback
  async updateApplication(id, status) {
    return pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
  },

  async deleteApplication(id) {
    return pool.query('DELETE FROM applications WHERE id = ?', [id]);
  },

  async countApplications() {
    const [result] = await pool.query('SELECT COUNT(*) AS count FROM applications');
    return result[0].count;
  },

  async checkDuplicateApplication(userId, jobpost_id) {
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND jobpost_id = ?',
      [userId, jobpost_id]
    );
    return existing.length > 0;
  },

  async getAllApplications() {
    const [applications] = await pool.query(
      `SELECT a.*, u.email AS user_email, j.title AS jobpost_title 
       FROM applications a 
       JOIN users u ON a.user_id = u.id 
       JOIN jobposts j ON a.jobpost_id = j.id
       ORDER BY a.applied_at DESC`
    );
    return applications;
  },

  async getApplicationWithJobAndEmployer(appId) {
    const [rows] = await pool.query(
      `SELECT a.user_id AS candidate_user_id, j.employer_id, j.title
       FROM applications a
       JOIN jobposts j ON a.jobpost_id = j.id
       WHERE a.id = ?`,
      [appId]
    );
    return rows[0];
  }
};

module.exports = ApplicationsModel;
