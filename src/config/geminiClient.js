const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;
let fallbackModel = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // PRIMARY: gemini-1.5-flash (Stable with free tier quota)
    model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // FALLBACK: gemini-1.5-flash (Stable fallback)
    fallbackModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    });
    
    console.log('✅ Gemini client initialized (Primary: 1.5-flash, Fallback: 1.5-flash)');
  } catch (error) {
    console.error('❌ Gemini init failed:', error.message);
  }
} else {
  console.error('❌ GEMINI_API_KEY missing');
}

module.exports = { model, fallbackModel };

