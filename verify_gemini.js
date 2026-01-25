const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const LOG_FILE = 'verification_result_v2.log';

function log(message) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n');
}

async function testGemini() {
  fs.writeFileSync(LOG_FILE, 'STARTING TEST V2\n');
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    log('ERROR: No API Key');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(key);
  log('Testing primary model: gemini-2.5-flash');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  try {
    const result = await model.generateContent("Hello from verification script.");
    log('SUCCESS: gemini-2.5-flash responded.');
    log('RESPONSE: ' + result.response.text());
  } catch (error) {
    log('FAILURE: ' + error.message);
  }
}

testGemini();
