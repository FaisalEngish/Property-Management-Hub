// Quick test to verify SystemHub is accessible
fetch('http://localhost:5000/system-hub', { credentials: 'include' })
  .then(res => {
    if (res.ok) {
      console.log('✅ SystemHub accessible - status:', res.status);
    } else {
      console.log('❌ SystemHub response error - status:', res.status);
    }
  })
  .catch(err => {
    console.log('⚠️ SystemHub connection error:', err.message);
  });

// Test API endpoints too
const testEndpoints = [
  '/api/auth/demo-users',
  '/api/dashboard/stats',
  '/api/properties'
];

testEndpoints.forEach(endpoint => {
  fetch(`http://localhost:5000${endpoint}`, { credentials: 'include' })
    .then(res => console.log(`${endpoint}: ${res.status}`))
    .catch(err => console.log(`${endpoint}: Error - ${err.message}`));
});