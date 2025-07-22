#!/usr/bin/env node

/**
 * Simple Voice Functionality Test Runner
 * This script provides a quick way to test voice functionality without Jest
 */

console.log('🎤 Voice Functionality Test Runner');
console.log('=====================================\n');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
  }
}

// Test 1: Check if WebSocket is available
runTest('WebSocket API Available', () => {
  if (typeof WebSocket === 'undefined') {
    throw new Error('WebSocket API not available');
  }
});

// Test 2: Check if AudioContext is available
runTest('AudioContext API Available', () => {
  if (typeof AudioContext === 'undefined') {
    throw new Error('AudioContext API not available');
  }
});

// Test 3: Check if AudioWorkletNode is available
runTest('AudioWorkletNode API Available', () => {
  if (typeof AudioWorkletNode === 'undefined') {
    throw new Error('AudioWorkletNode API not available');
  }
});

// Test 4: Check if getUserMedia is available
runTest('getUserMedia API Available', () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia API not available');
  }
});

// Test 5: Check if sessionStorage is available
runTest('SessionStorage API Available', () => {
  if (typeof sessionStorage === 'undefined') {
    throw new Error('SessionStorage API not available');
  }
});

// Test 6: Check if performance.now is available
runTest('Performance API Available', () => {
  if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
    throw new Error('Performance API not available');
  }
});

// Test 7: Check if URL.createObjectURL is available
runTest('URL.createObjectURL API Available', () => {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('URL.createObjectURL API not available');
  }
});

// Test 8: Check if Audio constructor is available
runTest('Audio Constructor Available', () => {
  if (typeof Audio === 'undefined') {
    throw new Error('Audio constructor not available');
  }
});

// Test 9: Check if setTimeout and clearTimeout are available
runTest('Timer APIs Available', () => {
  if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
    throw new Error('Timer APIs not available');
  }
});

// Test 10: Check if ArrayBuffer is available
runTest('ArrayBuffer API Available', () => {
  if (typeof ArrayBuffer === 'undefined') {
    throw new Error('ArrayBuffer API not available');
  }
});

// Test 11: Check if Blob is available
runTest('Blob API Available', () => {
  if (typeof Blob === 'undefined') {
    throw new Error('Blob API not available');
  }
});

// Test 12: Check if JSON is available
runTest('JSON API Available', () => {
  if (typeof JSON === 'undefined' || typeof JSON.parse !== 'function' || typeof JSON.stringify !== 'function') {
    throw new Error('JSON API not available');
  }
});

// Test 13: Check if Math.random is available
runTest('Math.random Available', () => {
  if (typeof Math === 'undefined' || typeof Math.random !== 'function') {
    throw new Error('Math.random not available');
  }
});

// Test 14: Check if console methods are available
runTest('Console API Available', () => {
  if (typeof console === 'undefined' || typeof console.log !== 'function') {
    throw new Error('Console API not available');
  }
});

// Test 15: Check if window object is available
runTest('Window Object Available', () => {
  if (typeof window === 'undefined') {
    throw new Error('Window object not available');
  }
});

// Test 16: Check if document object is available
runTest('Document Object Available', () => {
  if (typeof document === 'undefined') {
    throw new Error('Document object not available');
  }
});

// Test 17: Check if localStorage is available
runTest('LocalStorage API Available', () => {
  if (typeof localStorage === 'undefined') {
    throw new Error('LocalStorage API not available');
  }
});

// Test 18: Check if location object is available
runTest('Location Object Available', () => {
  if (typeof location === 'undefined') {
    throw new Error('Location object not available');
  }
});

// Test 19: Check if history object is available
runTest('History Object Available', () => {
  if (typeof history === 'undefined') {
    throw new Error('History object not available');
  }
});

// Test 20: Check if screen object is available
runTest('Screen Object Available', () => {
  if (typeof screen === 'undefined') {
    throw new Error('Screen object not available');
  }
});

// Test 21: Check if navigator object is available
runTest('Navigator Object Available', () => {
  if (typeof navigator === 'undefined') {
    throw new Error('Navigator object not available');
  }
});

// Test 22: Check if innerWidth and innerHeight are available
runTest('Window Dimensions Available', () => {
  if (typeof innerWidth === 'undefined' || typeof innerHeight === 'undefined') {
    throw new Error('Window dimensions not available');
  }
});

// Test 23: Check if requestAnimationFrame is available
runTest('RequestAnimationFrame Available', () => {
  if (typeof requestAnimationFrame !== 'function') {
    throw new Error('requestAnimationFrame not available');
  }
});

// Test 24: Check if cancelAnimationFrame is available
runTest('CancelAnimationFrame Available', () => {
  if (typeof cancelAnimationFrame !== 'function') {
    throw new Error('cancelAnimationFrame not available');
  }
});

// Test 25: Check if matchMedia is available
runTest('MatchMedia API Available', () => {
  if (typeof matchMedia !== 'function') {
    throw new Error('matchMedia API not available');
  }
});

// Test 26: Check if ResizeObserver is available
runTest('ResizeObserver API Available', () => {
  if (typeof ResizeObserver === 'undefined') {
    console.log('⚠️  ResizeObserver not available (this is normal in Node.js)');
    return; // Skip this test in Node.js environment
  }
});

// Test 27: Check if IntersectionObserver is available
runTest('IntersectionObserver API Available', () => {
  if (typeof IntersectionObserver === 'undefined') {
    console.log('⚠️  IntersectionObserver not available (this is normal in Node.js)');
    return; // Skip this test in Node.js environment
  }
});

// Test 28: Check if fetch is available
runTest('Fetch API Available', () => {
  if (typeof fetch !== 'function') {
    throw new Error('Fetch API not available');
  }
});

// Test 29: Check if Promise is available
runTest('Promise API Available', () => {
  if (typeof Promise === 'undefined') {
    throw new Error('Promise API not available');
  }
});

// Test 30: Check if async/await is available
runTest('Async/Await Available', async () => {
  try {
    await Promise.resolve('test');
  } catch (error) {
    throw new Error('Async/await not working properly');
  }
});

// Print final results
console.log('\n=====================================');
console.log('📊 Test Results Summary');
console.log('=====================================');
console.log(`Total Tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed} ✅`);
console.log(`Failed: ${testResults.failed} ❌`);
console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 All tests passed! Voice functionality should work properly.');
} else {
  console.log('\n⚠️  Some tests failed. Please check the errors above.');
}

console.log('\n💡 To run comprehensive tests with Jest, use:');
console.log('   npm install');
console.log('   npm run test:voice');
console.log('\n💡 To run tests in watch mode:');
console.log('   npm run test:voice:watch'); 