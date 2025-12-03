// Finance API Test Script
// Run with: node api-documentation/finance/test.js

const BASE_URL = 'http://localhost:5000';

async function authenticateDemo() {
  console.log('🔐 Authenticating with demo admin user...');
  
  const loginResponse = await fetch(`${BASE_URL}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    })
  });
  
  if (!loginResponse.ok) {
    throw new Error(`Authentication failed: ${loginResponse.status}`);
  }
  
  // Extract session cookie for future requests
  const setCookieHeader = loginResponse.headers.get('set-cookie');
  console.log('✅ Authentication successful\n');
  return setCookieHeader;
}

async function testFinanceAPI() {
  console.log('🧪 Testing Finance API Endpoints\n');

  try {
    // Authenticate first
    const sessionCookie = await authenticateDemo();
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie || ''
    };

    // Test 1: Get Finance Dashboard
    console.log('1. Testing Finance Dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/finance/dashboard`, { headers });
    if (dashboardResponse.ok) {
      const dashboard = await dashboardResponse.json();
      console.log('✅ Dashboard:', {
        properties: dashboard.totalProperties,
        monthlyRevenue: `฿${dashboard.monthlyRevenue.toLocaleString()}`,
        transactions: dashboard.totalTransactions
      });
    } else {
      console.log('❌ Dashboard test failed:', dashboardResponse.status);
    }

    // Test 2: Get Finance Analytics
    console.log('2. Testing Finance Analytics...');
    const analyticsResponse = await fetch(`${BASE_URL}/api/finance/analytics`, { headers });
    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      console.log('✅ Analytics:', {
        totalRevenue: `฿${(analytics.totalRevenue || 0).toLocaleString()}`,
        totalExpenses: `฿${(analytics.totalExpenses || 0).toLocaleString()}`,
        netProfit: `฿${(analytics.netProfit || 0).toLocaleString()}`,
        transactions: analytics.transactionCount || 0
      });
    } else {
      console.log('❌ Analytics test failed:', analyticsResponse.status);
    }

    // Test 3: Get All Finance Records
    console.log('\n3. Testing Get All Finance Records...');
    const financesResponse = await fetch(`${BASE_URL}/api/finance`, { headers });
    if (financesResponse.ok) {
      const finances = await financesResponse.json();
      console.log(`✅ Found ${finances.length} finance records`);
      if (finances.length > 0) {
        console.log('Sample record:', {
          id: finances[0].id,
          type: finances[0].type,
          amount: `฿${(finances[0].amount || 0).toLocaleString()}`,
          category: finances[0].category
        });
      }
    } else {
      console.log('❌ Finance records test failed:', financesResponse.status);
    }

    // Test 4: Get Property Summary
    console.log('\n4. Testing Property Finance Summary...');
    const summaryResponse = await fetch(`${BASE_URL}/api/finance/summary-by-property`, { headers });
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      console.log(`✅ Property summary for ${summary.length} properties`);
      if (summary.length > 0) {
        console.log('Sample property:', {
          name: summary[0].propertyName,
          revenue: `฿${(summary[0].revenue || 0).toLocaleString()}`,
          expenses: `฿${(summary[0].expenses || 0).toLocaleString()}`,
          netProfit: `฿${(summary[0].netProfit || 0).toLocaleString()}`
        });
      }
    } else {
      console.log('❌ Property summary test failed:', summaryResponse.status);
    }

    // Test 5: Get Monthly Report
    console.log('\n5. Testing Monthly Report...');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const reportResponse = await fetch(`${BASE_URL}/api/finance/monthly-report?year=${year}&month=${month}`, { headers });
    if (reportResponse.ok) {
      const report = await reportResponse.json();
      console.log('✅ Monthly Report:', {
        period: report.period,
        revenue: `฿${report.totalRevenue.toLocaleString()}`,
        expenses: `฿${report.totalExpenses.toLocaleString()}`,
        transactions: report.transactionCount
      });
    } else {
      console.log('❌ Monthly report test failed:', reportResponse.status);
    }

    // Test 6: Get Finance Categories
    console.log('\n6. Testing Finance Categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/finance/categories`, { headers });
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`✅ Found ${categories.length} categories:`, categories.slice(0, 5));
    } else {
      console.log('❌ Categories test failed:', categoriesResponse.status);
    }

    // Test 7: Villa-Specific Finance Query
    console.log('\n7. Testing Villa-Specific Finance Query...');
    const villaId = 17; // Use a known villa ID
    const dateStart = '2025-01-01';
    const dateEnd = '2025-12-31';
    
    const villaResponse = await fetch(`${BASE_URL}/api/finance/villa/${villaId}?dateStart=${dateStart}&dateEnd=${dateEnd}`, { headers });
    if (villaResponse.ok) {
      const villaData = await villaResponse.json();
      console.log('✅ Villa Finance Data:', {
        villaId: villaData.villaId,
        dateRange: `${villaData.dateStart} to ${villaData.dateEnd}`,
        revenue: `฿${(villaData.totalRevenue || 0).toLocaleString()}`,
        commission: `฿${(villaData.totalCommission || 0).toLocaleString()}`,
        bookings: villaData.bookingCount,
        commissionRecords: villaData.commissionRecords
      });
    } else {
      console.log('❌ Villa finance test failed:', villaResponse.status);
    }

    console.log('\n🎉 Finance API tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('\n⚠️  Make sure the server is running on port 5000');
    console.log('   Run: npm run dev');
  }
}

// Run the tests
testFinanceAPI();