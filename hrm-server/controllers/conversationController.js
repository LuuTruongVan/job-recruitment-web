
const ConversationService = require('../services/conversationService');

const ConversationController = {

  getUserConversations: async (req, res) => {
    const { userId } = req.params;
    try {
      const conversations = await ConversationService.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách hội thoại' });
    }
  },


  createConversation: async (req, res) => {
    const { candidate_id, employer_id } = req.body;
    try {
      const conversation = await ConversationService.createConversation(candidate_id, employer_id);
      res.json(conversation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi tạo conversation' });
    }
  }
};

module.exports = ConversationController;
