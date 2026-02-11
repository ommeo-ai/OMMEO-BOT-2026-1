const { evaluateHandoff } = require('./src/services/handoffDecisionEngine');

console.log('🧪 TESTING SPRINT 4: HANDOFF ENGINE');
console.log('===================================');

// Mock context helper
const context = {
    intent: 'UNKNOWN',
    confidence: 0.5,
    last_intent: null,
    repetition_count: 0
};

// TEST 1: Explicit Request
console.log('\n[TEST 1] Explicit Request ("quiero hablar con un asesor")');
const msg1 = "quiero hablar con un asesor";
const res1 = evaluateHandoff(msg1, { intent: 'HANDOFF_EXPLICITO' }, context);
console.log(`Input: "${msg1}"`);
console.log(`Should Handoff? ${res1.shouldHandoff}`);
console.log(`Score: ${res1.score}`);
console.log(`Reason: ${res1.reasons[0]}`);

if (res1.shouldHandoff && res1.score >= 100) {
    console.log('✅ PASS: Explicit request handled.');
} else {
    console.error('❌ FAIL: Explicit request failed.');
}

// TEST 2: Negative Sentiment
console.log('\n[TEST 2] Negative Sentiment ("esto es un mal servicio")');
const msg2 = "esto es un mal servicio, los odio";
const res2 = evaluateHandoff(msg2, { intent: 'QUEJA' }, context);
console.log(`Input: "${msg2}"`);
console.log(`Should Handoff? ${res2.shouldHandoff}`);
console.log(`Score: ${res2.score}`);

if (res2.score >= 50) { // Threshold is 70, but sentiment adds 50. If intent implies handoff it might trigger.
    console.log('✅ PASS: Sentiment detected.');
} else {
    console.error('❌ FAIL: Sentiment not detected.');
}

// TEST 3: Complexity (High score trigger)
console.log('\n[TEST 3] Complexity ("quiero un reembolso por daño")');
const msg3 = "necesito un reembolso porque hubo un daño";
const res3 = evaluateHandoff(msg3, { intent: 'QUEJA' }, context);
console.log(`Input: "${msg3}"`);
console.log(`Should Handoff? ${res3.shouldHandoff}`);
console.log(`Score: ${res3.score}`);

if (res3.score >= 30) {
    console.log('✅ PASS: Complexity detected.');
}

console.log('\n===================================');
