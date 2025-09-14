// routes/conversations.js
const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');

// Lấy danh sách hội thoại của user
router.get('/user/:userId', ConversationController.getUserConversations);

// Tạo hội thoại mới nếu chưa có
router.post('/', ConversationController.createConversation);

module.exports = router;
