const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const LOG_FILE = 'debug_models_result.log';

function log(message) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n');
}

async function debugModels() {
  fs.writeFileSync(LOG_FILE, 'STARTING REST DEBUG\n');
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    log('ERROR: No API Key');
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  log(`Requesting: ${url.replace(key, 'KEY')}`);

  try {
    const response = await axios.get(url);
    log('STATUS: ' + response.status);
    log('DATA: ' + JSON.stringify(response.data, null, 2));
  } catch (error) {
    log('ERROR: ' + error.message);
    if (error.response) {
      log('Response Data: ' + JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugModels();
