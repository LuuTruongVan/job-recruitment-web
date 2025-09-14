const pool = require('../db');

const EmployersModel = {
  async getPublicEmployerById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, address, phone, email, website, company_intro, avatar_url 
       FROM employers WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async getAllEmployers() {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.address, e.phone, e.email, e.website, e.company_intro, e.avatar_url, u.email AS user_email 
       FROM employers e 
       LEFT JOIN users u ON e.user_id = u.id`
    );
    return rows;
  },

  async countEmployers() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM employers');
    return rows[0].count;
  },

  async getEmployerByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM employers WHERE user_id = ?', [userId]);
    return rows[0];
  },

  async addEmployer(data) {
    const { user_id, name, address, email, website, company_intro, avatar_url } = data;
    const [result] = await pool.query(
      'INSERT INTO employers (user_id, name, address, email, website, company_intro, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, name, address, email, website, company_intro, avatar_url]
    );
    return result.insertId;
  },

  async updateEmployer(data) {
    const { user_id, name, address, email, website, company_intro, avatar_url } = data;
    await pool.query(
      'UPDATE employers SET name=?, address=?, email=?, website=?, company_intro=?, avatar_url=? WHERE user_id=?',
      [name, address, email, website, company_intro, avatar_url, user_id]
    );
  },

  async deleteEmployerById(id) {
    await pool.query('DELETE FROM employers WHERE id = ?', [id]);
  }
};

module.exports = EmployersModel;
