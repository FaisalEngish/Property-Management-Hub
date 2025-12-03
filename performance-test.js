// Simple performance test without Lighthouse
const baseUrl = 'http://localhost:5000';

async function testPerformance() {
  console.log('⚡ Running basic performance tests...\n');
  
  const testRoutes = [
    '/',
    '/dashboard', 
    '/system-hub',
    '/properties',
    '/tasks',
    '/bookings'
  ];
  
  for (const route of testRoutes) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}${route}`);
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${route}: ${loadTime}ms (${response.status})`);
      
    } catch (error) {
      console.log(`❌ ${route}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 Performance test completed!');
}

testPerformance();