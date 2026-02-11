const { INTENT_PATTERNS } = require('../data/knowledgeBase');

/**
 * Handoff Decision Engine
 * Evaluates context and message to determine if human intervention is needed.
 */

const SCORING_RULES = {
  EXPLICIT_REQUEST: 100,
  NEGATIVE_SENTIMENT: 50, // Keywords: odio, pesimo, mal servicio, robo
  COMPLEXITY_HIGH: 30,    // Keywords: reembolso, accidente, daño, perdida
  REPETITION: 20,         // Repeating same intent 3+ times
  UNKNOWN_INTENT: 15      // Consecutive unknown intents
};

const THRESHOLD = 70;

const NEGATIVE_KEYWORDS = /odio|pesimo|pésimo|mal servicio|horrible|terrible|robo|estafa|denunciar|queja|reclamo/i;
const COMPLEX_KEYWORDS = /reembolso|devoluci[oó]n|accidente|dañ[oó]|rompi[oó]|perdida|p[eé]rdida|polic[ií]a/i;

function evaluateHandoff(message, intentResult, context = {}) {
  let score = 0;
  let reasons = [];

  const msg = message.toLowerCase();

  // 1. Explicit Request (Immediate Trigger)
  if (INTENT_PATTERNS.HANDOFF_EXPLICITO.test(msg)) {
    return { shouldHandoff: true, score: 100, reasons: ['user_request'], handOffMessage: getHandoffMessage(['user_request']) };
  }

  // 2. Service Specific Rules (Mandatory Handoffs)
  if (intentResult.triggerHandoff) {
    return { shouldHandoff: true, score: 90, reasons: [intentResult.reason], handOffMessage: getHandoffMessage([intentResult.reason]) };
  }

  // 3. Sentiment Analysis (Basic Keyword Match)
  if (NEGATIVE_KEYWORDS.test(msg)) {
    score += SCORING_RULES.NEGATIVE_SENTIMENT;
    reasons.push('negative_sentiment');
  }

  // 4. Complexity Analysis
  if (COMPLEX_KEYWORDS.test(msg)) {
    score += SCORING_RULES.COMPLEXITY_HIGH;
    reasons.push('complex_topic');
  }

  // 5. Repetition / Confusion Loop
  if (context.consecutive_unknowns >= 2) {
    score += (SCORING_RULES.UNKNOWN_INTENT * 2);
    reasons.push('confusion_loop');
  }
  
  if (context.last_intent === intentResult.intent && intentResult.intent !== 'UNKNOWN') {
     // User repeating same intent logic? Maybe not handoff immediately but watch out.
     // If user says "Limpieza" -> Bot: "Que tipo?" -> User: "Limpieza" -> Loop.
     if (context.repetition_count >= 2) {
       score += SCORING_RULES.REPETITION * 2;
       reasons.push('repetition_loop');
     }
  }

  // Decision
  const shouldHandoff = score >= THRESHOLD;
  
  return {
    shouldHandoff,
    score,
    reasons,
    handOffMessage: shouldHandoff ? getHandoffMessage(reasons) : null
  };
}

function getHandoffMessage(reasons) {
  if (reasons.includes('negative_sentiment') || reasons.includes('complex_topic')) {
    return "Lamento los inconvenientes. 🧡 Ya mismo escalo tu caso con nuestro equipo de Calidad para darte una solución prioritaria.";
  }
  return "Permíteme conectarte con un asesor humano para que te brinde una atención más personalizada. 🧡";
}

module.exports = { evaluateHandoff };
