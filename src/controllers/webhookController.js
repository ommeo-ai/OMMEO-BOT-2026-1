const { processIncomingMessage } = require('../services/messageProcessor');

// ============================================
// WEBHOOK VERIFICATION (GET)
// ============================================
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook] ✅ Verification successful');
    return res.status(200).send(challenge);
  }
  
  console.error('[Webhook] ❌ Verification failed');
  return res.sendStatus(403);
};

// ============================================
// MESSAGE HANDLER (POST)
// ============================================
exports.handleIncomingMessage = async (req, res) => {
  const body = req.body;
  
  // Immediate 200 OK (critical for WhatsApp)
  res.sendStatus(200);

  console.log('[Webhook] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[Webhook] 📨 Event received');

  if (!body.object) {
    console.log('[Webhook] ⚠️ Unknown event');
    return;
  }

  // Extract message data with safe navigation
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const messages = value?.messages;
  const message = messages?.[0];

  if (!message) {
    console.log('[Webhook] ℹ️ Status update (not a message)');
    return;
  }

  const from = message.from;
  const phoneNumberId = value.metadata?.phone_number_id;
  const messageType = message.type;
  
  // Get message text
  let messageBody;
  if (message.text?.body) {
    messageBody = message.text.body;
  } else if (message.button?.text) {
    messageBody = message.button.text;
  } else if (message.interactive?.button_reply?.title) {
    messageBody = message.interactive.button_reply.title;
  } else {
    messageBody = `[${messageType || 'unknown'}]`;
  }

  console.log(`[Webhook] 📱 From: ${from}`);
  console.log(`[Webhook] 💬 Message: "${messageBody}"`);

  // Process message asynchronously
  processIncomingMessage({
    phoneNumberId,
    from,
    messageBody,
    timestamp: Date.now(),
    messageType,
    fullPayload: message
  }).catch(err => {
    console.error('[Webhook] ❌ Processing error:', err.message);
  });
};
