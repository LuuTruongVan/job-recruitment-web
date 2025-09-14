const pool = require('../db');

const CandidateModel = {
  async getAll() {
    const [rows] = await pool.query(
      `SELECT c.id, c.full_name, c.phone, c.address, c.skills, c.avatar_url, u.email 
       FROM candidates c 
       LEFT JOIN users u ON c.user_id = u.id`
    );
    return rows;
  },

  async count() {
    const [result] = await pool.query('SELECT COUNT(*) AS count FROM candidates');
    return result[0].count;
  },

  async create(data) {
    const { user_id, full_name, phone, address, skills, avatar_url } = data;
    const [existing] = await pool.query('SELECT * FROM candidates WHERE user_id = ?', [user_id]);
    if (existing.length > 0) throw new Error('Profile already exists');

    const [result] = await pool.query(
      'INSERT INTO candidates (user_id, full_name, phone, address, skills, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, full_name, phone, address, skills, avatar_url]
    );
    return result.insertId;
  },

  async update(user_id, data) {
    const { full_name, phone, address, skills, avatar_url } = data;
    await pool.query(
      'UPDATE candidates SET full_name=?, phone=?, address=?, skills=?, avatar_url=? WHERE user_id=?',
      [full_name, phone, address, skills, avatar_url, user_id]
    );
  },

  async getByUserId(user_id) {
    const [rows] = await pool.query('SELECT * FROM candidates WHERE user_id = ?', [user_id]);
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
  }
};

module.exports = CandidateModel;
