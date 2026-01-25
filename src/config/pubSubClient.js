const { PubSub } = require('@google-cloud/pubsub');

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const topicNameOrId = 'incoming-messages';

console.log(`[PubSub Init] Project ID: "${projectId}"`);
console.log(`[PubSub Init] Topic: "${topicNameOrId}"`);

const pubSubClient = new PubSub();

async function publishMessage(data) {
  console.log(`[PubSub] Attempting to publish message...`);
  console.log(`[PubSub] Using project: ${projectId}, topic: ${topicNameOrId}`);
  
  const dataBuffer = Buffer.from(JSON.stringify(data));

  try {
    const messageId = await pubSubClient
      .topic(topicNameOrId)
      .publishMessage({ data: dataBuffer });
    console.log(`[PubSub] SUCCESS! Message ${messageId} published to ${topicNameOrId}`);
    return messageId;
  } catch (error) {
    console.error(`[PubSub] FAILED to publish!`);
    console.error(`[PubSub] Error code: ${error.code}`);
    console.error(`[PubSub] Error message: ${error.message}`);
    console.error(`[PubSub] Full error:`, error);
    throw error;
  }
}

module.exports = { publishMessage, pubSubClient };
