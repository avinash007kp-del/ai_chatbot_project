const express = require('express');
const router = express.Router();
const { getChats, createChat, getChatById, sendMessage, clearHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getChats)
  .post(protect, createChat)
  .delete(protect, clearHistory);

router.route('/:id')
  .get(protect, getChatById);

router.route('/:id/message')
  .post(protect, sendMessage);

module.exports = router;
