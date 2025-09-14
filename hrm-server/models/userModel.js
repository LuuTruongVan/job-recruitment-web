const pool = require('../db');

const userModel = {
  findByEmail: async (connection, email) => {
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows;
  },

  findById: async (connection, id) => {
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  createUser: async (connection, name, email, hashedPassword, role) => {
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, role === 'admin' ? 1 : 0]
    );
    return result.insertId;
  },

  updateUser: async (connection, name, hashedPassword, role, userId) => {
    await connection.execute(
      'UPDATE users SET name = ?, password = ?, role = ? WHERE id = ?',
      [name, hashedPassword, role, userId]
    );
  },

  createOtpCode: async (connection, userId, otpCode) => {
    await connection.execute('INSERT INTO otp_codes (user_id, token) VALUES (?, ?)', [userId, otpCode]);
  },

  deleteOtpCode: async (connection, userId) => {
    await connection.execute('DELETE FROM otp_codes WHERE user_id = ?', [userId]);
  },

  verifyOtp: async (connection, userId, otp) => {
    const [rows] = await connection.query(
      'SELECT * FROM otp_codes WHERE user_id = ? AND token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)',
      [userId, otp]
    );
    return rows;
  },

  createCandidateProfile: async (connection, userId, name) => {
    await connection.execute(
      'INSERT INTO candidates (user_id, full_name, phone, address, skills) VALUES (?, ?, ?, ?, ?)',
      [userId, name, '', '', '']
    );
  },

  createEmployerProfile: async (connection, userId, name, email) => {
    await connection.execute(
      'INSERT INTO employers (user_id, name, address, email, website) VALUES (?, ?, ?, ?, ?)',
      [userId, name, '', email, '']
    );
  },

  deleteCandidateProfile: async (connection, userId) => {
    await connection.execute('DELETE FROM candidates WHERE user_id = ?', [userId]);
  },

  deleteEmployerProfile: async (connection, userId) => {
    await connection.execute('DELETE FROM employers WHERE user_id = ?', [userId]);
  },

  verifyUserByOtp: async (connection, userId) => {
    await connection.execute('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);
    await connection.execute('DELETE FROM otp_codes WHERE user_id = ?', [userId]);
  },

  toggleUserStatus: async (connection, id, isActive) => {
    await connection.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
  },

  getBasicProfile: async (connection, id) => {
    const [rows] = await connection.query('SELECT id, email, role, name FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  getCandidateProfile: async (connection, userId) => {
    const [rows] = await connection.query(
      'SELECT full_name, phone, address, skills, avatar_url FROM candidates WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  },

  getEmployerProfile: async (connection, userId) => {
    const [rows] = await connection.query(
      'SELECT name, address, email, phone, website, company_intro, avatar_url FROM employers WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  },

  updateCandidateProfile: async (connection, userId, full_name, phone, address, skills, avatar_url) => {
    await connection.execute(
      'UPDATE candidates SET full_name = ?, phone = ?, address = ?, skills = ?, avatar_url = ? WHERE user_id = ?',
      [full_name, phone, address, skills, avatar_url || '', userId]
    );
    await connection.execute('UPDATE users SET name = ? WHERE id = ?', [full_name, userId]);
  },

  updateEmployerProfile: async (connection, userId, company_name, address, email, phone, website, company_intro, avatar_url) => {
    await connection.execute(
      'UPDATE employers SET name = ?, address = ?, email = ?, phone = ?, website = ?, company_intro = ?, avatar_url = ? WHERE user_id = ?',
      [company_name, address, email, phone, website, company_intro, avatar_url || '', userId]
    );
    await connection.execute('UPDATE users SET name = ? WHERE id = ?', [company_name, userId]);
  },

  updatePassword: async (connection, id, hashedPassword) => {
    await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  },

  getAllUsers: async (connection) => {
    const [rows] = await connection.query('SELECT id, name, email, role FROM users');
    return rows;
  },

  deleteUser: async (connection, id) => {
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);
  },

  verifyEmailByToken: async (connection, token) => {
    const [rows] = await connection.query('SELECT * FROM verify_tokens WHERE token = ?', [token]);
    if (rows.length > 0) {
      const userId = rows[0].user_id;
      await connection.execute('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);
      await connection.execute('DELETE FROM verify_tokens WHERE user_id = ?', [userId]);
      return userId;
    }
    return null;
  },

  createResetToken: async (connection, email, otp) => {
    await connection.execute(
      'INSERT INTO reset_password_tokens (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
      [email, otp]
    );
  },

  verifyResetOtp: async (connection, email, otp) => {
    const [rows] = await connection.query(
      'SELECT * FROM reset_password_tokens WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );
    return rows;
  },

  resetPassword: async (connection, email, hashedPassword) => {
    await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    await connection.execute('DELETE FROM reset_password_tokens WHERE email = ?', [email]);
  }
};

module.exports = userModel;