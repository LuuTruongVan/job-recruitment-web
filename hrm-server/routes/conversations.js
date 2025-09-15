// routes/conversations.js
const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');


router.get('/user/:userId', ConversationController.getUserConversations);


router.post('/', ConversationController.createConversation);

module.exports = router;
