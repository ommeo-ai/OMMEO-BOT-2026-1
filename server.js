require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to preserve raw body for signature verification (if needed later)
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

// Default health check
app.get('/', (req, res) => {
  res.send('OMMEO Agentic Bot is Active');
});

// Routes
const webhookRoutes = require('./src/routes/webhookRoutes');
app.use('/webhook', webhookRoutes);

// Pub/Sub route removed in v2.0 simplification
// const pubSubController = require('./src/controllers/pubSubController');
// app.post('/pubsub-push', pubSubController.handlePubSubPush);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
