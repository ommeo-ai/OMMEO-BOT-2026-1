const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// GET /webhook - Verification
router.get('/', webhookController.verifyWebhook);

// POST /webhook - Incoming Messages
router.post('/', webhookController.handleIncomingMessage);

module.exports = router;
