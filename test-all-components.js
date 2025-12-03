// Comprehensive test of all main application components
const testRoutes = [
  { path: '/', name: 'Home Dashboard' },
  { path: '/dashboard', name: 'Main Dashboard' },
  { path: '/system-hub', name: 'System Hub' },
  { path: '/properties', name: 'Properties' },
  { path: '/tasks', name: 'Tasks' },
  { path: '/bookings', name: 'Bookings' },
  { path: '/finances', name: 'Finances' },
  { path: '/users', name: 'Users' }
];

console.log('🔍 Testing all application routes...\n');

Promise.all(
  testRoutes.map(async (route) => {
    try {
      const res = await fetch(`http://localhost:5000${route.path}`, { 
        credentials: 'include',
        headers: { 'Accept': 'text/html' }
      });
      
      const status = res.ok ? '✅' : '❌';
      console.log(`${status} ${route.name} (${route.path}): ${res.status}`);
      
      return { route: route.path, status: res.status, ok: res.ok };
    } catch (err) {
      console.log(`⚠️ ${route.name} (${route.path}): ${err.message}`);
      return { route: route.path, status: 'ERROR', ok: false };
    }
  })
).then(results => {
  const working = results.filter(r => r.ok).length;
  const total = results.length;
  console.log(`\n🎯 Results: ${working}/${total} routes working`);
  
  if (working === total) {
    console.log('🎉 All components are accessible!');
  } else {
    console.log('⚠️ Some components may need attention');
  }
});