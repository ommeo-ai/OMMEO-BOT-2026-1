const { detectIntent } = require('./src/services/intentService');
const { extractBookingData } = require('./src/services/bookingService');
const { parseTemporalExpression } = require('./src/services/temporalNLU');

console.log('🧪 TESTING SPRINT 3 FEATURES');
console.log('============================');

// TEST 1: Context-Aware Intent
console.log('\n[TEST 1] Context-Aware Intent Detection');
const msg = "quiero una profunda";

// Case A: No context
const resultNoContext = detectIntent(msg, {});
console.log('Input: "' + msg + '" | No Context -> Intent: ' + resultNoContext.intent);

// Case B: With 'limpieza' context
const context = { last_service_type: 'limpieza' };
const resultWithContext = detectIntent(msg, context);
console.log('Input: "' + msg + '" | Context: limpieza -> Intent: ' + resultWithContext.intent);

if (resultWithContext.intent === 'LIMPIEZA_PROFUNDA') {
  console.log('✅ PASS: Context correctly resolved ambiguity.');
} else {
  console.error('❌ FAIL: Context did not resolve ambiguity.');
}


// TEST 2: Temporal NLU
console.log('\n[TEST 2] Temporal NLU Parsing');
const timeMsg = "necesito para mañana en la mañana";
const bookingData = extractBookingData(timeMsg, {});

console.log('Input: "' + timeMsg + '"');
console.log('Parsed Date: ' + bookingData.requested_date);
console.log('Parsed Time: ' + bookingData.requested_time);

// Validation
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const expectedDate = tomorrow.toISOString().split('T')[0];

if (bookingData.requested_date === expectedDate && bookingData.requested_time === '8:00') {
  console.log('✅ PASS: Temporal expression parsed correctly.');
} else {
  console.error('❌ FAIL: Expected ' + expectedDate + ' 8:00');
}

console.log('\n============================');
