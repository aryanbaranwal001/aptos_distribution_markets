const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// POST /api/v1/chat
router.post('/', chatController.chat);

module.exports = router;
