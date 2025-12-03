// API Integration Test - Test actual API endpoints with authentication
const baseUrl = 'http://localhost:5000';

async function testWithAuth() {
  console.log('🔐 Testing API with authentication...\n');
  
  // Step 1: Login with demo user
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com' }),
      credentials: 'include'
    });
    
    if (loginResponse.ok) {
      console.log('✅ Demo login successful');
      
      // Step 2: Test authenticated endpoints
      const endpoints = [
        '/api/properties',
        '/api/tasks', 
        '/api/bookings',
        '/api/users',
        '/api/dashboard/stats'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${baseUrl}${endpoint}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            const count = Array.isArray(data) ? data.length : 'N/A';
            console.log(`✅ ${endpoint}: ${response.status} (${count} items)`);
          } else {
            console.log(`❌ ${endpoint}: ${response.status}`);
          }
        } catch (error) {
          console.log(`⚠️ ${endpoint}: ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ Demo login failed:', loginResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Authentication test error:', error.message);
  }
}

testWithAuth();