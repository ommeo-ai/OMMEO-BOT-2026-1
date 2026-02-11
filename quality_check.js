const { execSync } = require('child_process');

console.log('🛡️ OMMEO QUALITY GATE 🛡️');
console.log('==========================');

const tests = [
  { name: 'Sprint 3: Temporal NLU & Context', cmd: 'node test_sprint3.js' },
  { name: 'Sprint 4: Handoff Decision Engine', cmd: 'node test_sprint4.js' }
];

let failed = false;

for (const test of tests) {
  try {
    console.log(`\n▶ Running: ${test.name}...`);
    execSync(test.cmd, { stdio: 'inherit' });
    console.log(`✅ ${test.name} PASSED`);
  } catch (e) {
    console.error(`❌ ${test.name} FAILED`);
    failed = true;
  }
}

console.log('\n==========================');
if (failed) {
  console.error('🛑 QUALITY CHECK FAILED. FIX ERRORS BEFORE DEPLOY.');
  process.exit(1);
} else {
  console.log('✨ ALL SYSTEMS GREEN. READY TO DEPLOY. 🚀');
  process.exit(0);
}
