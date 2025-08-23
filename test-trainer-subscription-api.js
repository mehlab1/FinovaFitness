// Test script for trainer subscription API endpoints
const API_BASE = 'http://localhost:3001/api/trainer/subscriptions';

async function testTrainerAPI() {
  console.log('🧪 Testing Trainer Subscription API Endpoints...\n');

  try {
    // Test 1: Get pending subscriptions (should fail without token)
    console.log('1. Testing GET /pending (should require authentication)...');
    const pendingResponse = await fetch(`${API_BASE}/1/pending`);
    const pendingData = await pendingResponse.json();
    console.log(`   Status: ${pendingResponse.status}`);
    console.log(`   Response: ${JSON.stringify(pendingData, null, 2)}`);
    
    if (pendingResponse.status === 401 || pendingResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 2: Get all subscriptions (should fail without token)
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

    // Test 3: Get stats (should fail without token)
    console.log('\n3. Testing GET /stats (should require authentication)...');
    const statsResponse = await fetch(`${API_BASE}/1/stats`);
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Response: ${JSON.stringify(statsData, null, 2)}`);
    
    if (statsResponse.status === 401 || statsResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 4: Approve subscription (should fail without token)
    console.log('\n4. Testing POST /approve (should require authentication)...');
    const approveResponse = await fetch(`${API_BASE}/1/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_id: 1 })
    });
    const approveData = await approveResponse.json();
    console.log(`   Status: ${approveResponse.status}`);
    console.log(`   Response: ${JSON.stringify(approveData, null, 2)}`);
    
    if (approveResponse.status === 401 || approveResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 5: Reject subscription (should fail without token)
    console.log('\n5. Testing POST /reject (should require authentication)...');
    const rejectResponse = await fetch(`${API_BASE}/1/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_id: 1 })
    });
    const rejectData = await rejectResponse.json();
    console.log(`   Status: ${rejectResponse.status}`);
    console.log(`   Response: ${JSON.stringify(rejectData, null, 2)}`);
    
    if (rejectResponse.status === 401 || rejectResponse.status === 403) {
      console.log('   ✅ Authentication required - working correctly');
    } else {
      console.log('   ❌ Authentication not working properly');
    }

    // Test 6: Test health endpoint (should work without token)
    console.log('\n6. Testing health endpoint (should work without authentication)...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
    
    if (healthResponse.status === 200) {
      console.log('   ✅ Health endpoint working correctly');
    } else {
      console.log('   ❌ Health endpoint not working');
    }

    console.log('\n✅ Trainer Subscription API Endpoint Tests Completed!');
    console.log('\n📝 Frontend Testing Instructions:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login as a trainer user');
    console.log('3. Navigate to "Subscription Management" in the sidebar');
    console.log('4. Test the pending requests, all subscriptions, and statistics tabs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTrainerAPI();
