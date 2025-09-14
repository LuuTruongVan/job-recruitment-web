// services/conversationService.js
const ConversationModel = require('../models/conversationModel');

const ConversationService = {
  getUserConversations: async (userId) => {
    const { candidateId, employerId } = await ConversationModel.getCandidateAndEmployerId(userId);
    const [rows] = await ConversationModel.getUserConversations(candidateId, employerId);

    // Gắn tên hiển thị cho frontend
    const formatted = rows.map(r => ({
      ...r,
      name: r.candidate_id === candidateId ? r.employer_name : r.candidate_name
    }));

    return formatted;
  },

  createConversation: async (candidateId, employerId) => {
    const [existing] = await ConversationModel.findByCandidateAndEmployer(candidateId, employerId);

    if (existing.length > 0) {
      return existing[0];
    }

    const [result] = await ConversationModel.createConversation(candidateId, employerId);
    const [newConv] = await ConversationModel.getById(result.insertId);
    return newConv[0];
  }
};

module.exports = ConversationService;
