// Test script for member monthly plan API endpoints
const API_BASE = 'http://localhost:3001/api/member/monthly-plans';

async function testMemberAPI() {
  console.log('🧪 Testing Member Monthly Plan API Endpoints...\n');

  try {
    // Test 1: Get available plans (should fail without token)
    console.log('1. Testing GET /available (should require authentication)...');
    const availableResponse = await fetch(`${API_BASE}/1/available`);
    const availableData = await availableResponse.json();
    console.log(`   Status: ${availableResponse.status}`);
    console.log(`   Response: ${JSON.stringify(availableData, null, 2)}`);
    
    if (availableResponse.status === 401 || availableResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 2: Get subscriptions (should fail without token)
    console.log('\n2. Testing GET /subscriptions (should require authentication)...');
    const subscriptionsResponse = await fetch(`${API_BASE}/1/subscriptions`);
    const subscriptionsData = await subscriptionsResponse.json();
    console.log(`   Status: ${subscriptionsResponse.status}`);
    console.log(`   Response: ${JSON.stringify(subscriptionsData, null, 2)}`);
    
    if (subscriptionsResponse.status === 401 || subscriptionsResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 3: Request subscription (should fail without token)
    console.log('\n3. Testing POST /request-subscription (should require authentication)...');
    const requestResponse = await fetch(`${API_BASE}/1/request-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: 1 })
    });
    const requestData = await requestResponse.json();
    console.log(`   Status: ${requestResponse.status}`);
    console.log(`   Response: ${JSON.stringify(requestData, null, 2)}`);
    
    if (requestResponse.status === 401 || requestResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 4: Test health endpoint (should work without token)
    console.log('\n4. Testing health endpoint (should work without authentication)...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
    
    if (healthResponse.status === 200) {
      console.log('   ✅ Health endpoint working correctly');
    } else {
      console.log('   ❌ Health endpoint not working');
    }

    console.log('\n✅ Member API Endpoint Tests Completed!');
    console.log('\n📝 Frontend Testing Instructions:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login as a member user');
    console.log('3. Navigate to "Monthly Plans" in the sidebar');
    console.log('4. Test browsing plans and requesting subscriptions');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMemberAPI();
