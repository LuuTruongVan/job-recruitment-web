// models/conversationModel.js
const pool = require('../db');

const ConversationModel = {
  // Lấy danh sách conversation theo candidate_id hoặc employer_id
  getUserConversations: (candidateId, employerId) => {
    return pool.query(
      `
      SELECT c.id, c.candidate_id, c.employer_id, c.created_at,
             cand.full_name AS candidate_name,
             emp.name AS employer_name
      FROM conversations c
      LEFT JOIN candidates cand ON c.candidate_id = cand.id
      LEFT JOIN employers emp ON c.employer_id = emp.id
      WHERE c.candidate_id = ? OR c.employer_id = ?
      ORDER BY c.created_at DESC
      `,
      [candidateId, employerId]
    );
  },

  // Kiểm tra xem conversation đã tồn tại chưa
  findByCandidateAndEmployer: (candidateId, employerId) => {
    return pool.query(
      "SELECT * FROM conversations WHERE candidate_id = ? AND employer_id = ?",
      [candidateId, employerId]
    );
  },

  // Tạo conversation mới
  createConversation: (candidateId, employerId) => {
    return pool.query(
      "INSERT INTO conversations (candidate_id, employer_id, created_at) VALUES (?, ?, NOW())",
      [candidateId, employerId]
    );
  },

  // Lấy conversation theo ID
  getById: (id) => {
    return pool.query(
      `
      SELECT c.id, c.candidate_id, c.employer_id, c.created_at,
             cand.full_name AS candidate_name,
             emp.name AS employer_name
      FROM conversations c
      LEFT JOIN candidates cand ON c.candidate_id = cand.id
      LEFT JOIN employers emp ON c.employer_id = emp.id
      WHERE c.id = ?
      `,
      [id]
    );
  },

  // Lấy candidateId và employerId từ userId
  getCandidateAndEmployerId: async (userId) => {
    const [candidateRows] = await pool.query("SELECT id FROM candidates WHERE user_id = ?", [userId]);
    const [employerRows] = await pool.query("SELECT id FROM employers WHERE user_id = ?", [userId]);
    return {
      candidateId: candidateRows[0]?.id || 0,
      employerId: employerRows[0]?.id || 0
    };
  }
};

module.exports = ConversationModel;
