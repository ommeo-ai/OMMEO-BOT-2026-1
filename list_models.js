const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const LOG_FILE = 'list_models_result.log';

function log(message) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n');
}

async function listModels() {
  fs.writeFileSync(LOG_FILE, 'STARTING MODEL LIST\n');
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    log('ERROR: No API Key');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(key);
  // Note: ListModels is a static method on the primitive, but the SDK doesn't expose it easily via GenerativeModel.
  // We need to use the model manager if available, or just try to instantiate specific known legacy models.
  // Actually, let's try to infer from error or just try a few common ones. 
  // Wait, SDK has 'getGenerativeModel'. If list isn't easy, I'll brute force check.
  
  const candidates = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  for (const m of candidates) {
    log(`Testing candidate: ${m}`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      // Generate a tiny content to check if it exists and is callable
      const r = await model.generateContent("Hi");
      log(`SUCCESS: ${m} is available.`);
    } catch (e) {
      log(`FAILED: ${m} - ${e.message}`);
    }
  }
}

listModels();
