const { processIncomingMessage } = require('../services/messageProcessor');

exports.handlePubSubPush = async (req, res) => {
  try {
    // Pub/Sub Push messages come in a specific format:
    // { message: { data: "base64...", messageId: "..." }, subscription: "..." }
    
    if (!req.body || !req.body.message) {
      console.warn('Missing message field in Pub/Sub Push body');
      return res.status(400).send('Bad Request: Missing message');
    }

    const pubSubMessage = req.body.message;
    const dataBase64 = pubSubMessage.data;
    
    if (!dataBase64) {
      console.warn('Missing data field in Pub/Sub message');
      return res.status(200).send(); // Ack anyway to prevent retries of bad data
    }

    const dataString = Buffer.from(dataBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(dataString);

    console.log(`[PubSub] Received message ${pubSubMessage.messageId}`);
    
    // Trigger "The Brain"
    // Note: We don't await this if we want to return 200 OK instantly to Pub/Sub,
    // BUT Cloud Run invokes are synchronous HTTP calls. We SHOULD await to ensure completion
    // before the container instance might be throttled/killed.
    await processIncomingMessage(payload);

    res.status(200).send();

  } catch (error) {
    console.error('[PubSub] Error processing push message:', error);
    // Return 500 to retry, or 200 to discard if it's a permanent error logic
    res.status(500).send();
  }
};
