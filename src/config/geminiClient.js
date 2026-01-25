const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;
let fallbackModel = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // PRIMARY: gemini-1.5-flash-001 (Specific version to avoid alias 404s)
    model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // FALLBACK: gemini-pro (Old reliable)
    fallbackModel = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    });
    
    console.log('✅ Gemini client initialized (Primary: Flash-001, Secondary: Pro)');
  } catch (error) {
    console.error('❌ Gemini init failed:', error.message);
  }
} else {
  console.error('❌ GEMINI_API_KEY missing');
}

module.exports = { model, fallbackModel };
