// Simple test script to verify admin API endpoints
const API_BASE = 'http://localhost:3001/api/admin/monthly-plans';

async function testAdminAPI() {
  console.log('🧪 Testing Admin Monthly Plan API Endpoints...\n');

  try {
    // Test 1: Get pending plans (should fail without token)
    console.log('1. Testing GET /pending (should require authentication)...');
    const pendingResponse = await fetch(`${API_BASE}/pending`);
    const pendingData = await pendingResponse.json();
    console.log(`   Status: ${pendingResponse.status}`);
    console.log(`   Response: ${JSON.stringify(pendingData, null, 2)}`);
    
    if (pendingResponse.status === 401 || pendingResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 2: Get stats (should fail without token)
    console.log('\n2. Testing GET /stats (should require authentication)...');
    const statsResponse = await fetch(`${API_BASE}/stats`);
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Response: ${JSON.stringify(statsData, null, 2)}`);
    
    if (statsResponse.status === 401 || statsResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 3: Test health endpoint (should work without token)
    console.log('\n3. Testing health endpoint (should work without authentication)...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
    
    if (healthResponse.status === 200) {
      console.log('   ✅ Health endpoint working correctly');
    } else {
      console.log('   ❌ Health endpoint not working');
    }

    console.log('\n✅ API Endpoint Tests Completed!');
    console.log('\n📝 Frontend Testing Instructions:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login as an admin user');
    console.log('3. Navigate to "Monthly Plan Approval" in the sidebar');
    console.log('4. Test the approval/rejection functionality');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminAPI();
