// Test API integration functionality
console.log('🧪 Testing API Integration');

// Test membership plans API
async function testMembershipPlansAPI() {
  console.log('\n📋 Testing Membership Plans API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/frontdesk/membership-plans');
    const data = await response.json();
    
    if (response.ok && data.success && data.data.length > 0) {
      console.log('✅ Membership plans API working');
      console.log(`   Found ${data.data.length} plans:`);
      data.data.forEach(plan => {
        console.log(`   - ${plan.name}: $${plan.price} (${plan.duration})`);
      });
      return data.data[0].id; // Return first plan ID for member creation test
    } else {
      console.log('❌ Membership plans API failed');
      console.log('   Response:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Membership plans API error:', error.message);
    return null;
  }
}

// Test member creation API
async function testMemberCreationAPI(planId) {
  console.log('\n📋 Testing Member Creation API...');
  
  if (!planId) {
    console.log('❌ Skipping member creation test - no plan ID available');
    return false;
  }
  
  const testMemberData = {
    first_name: 'API',
    last_name: 'Test',
    email: `api.test.${Date.now()}@example.com`,
    phone: '1234567890',
    membership_plan_id: planId,
    payment_method: 'card',
    payment_confirmed: true
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/frontdesk/create-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMemberData)
    });
    
    const data = await response.json();
    
    if (response.status === 201 && data.success) {
      console.log('✅ Member creation API working');
      console.log(`   Created member: ${data.data.user.email}`);
      console.log(`   User ID: ${data.data.user.id}`);
      console.log(`   Role: ${data.data.user.role}`);
      return true;
    } else {
      console.log('❌ Member creation API failed');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Member creation API error:', error.message);
    return false;
  }
}

// Test POS summary API
async function testPOSSummaryAPI() {
  console.log('\n📋 Testing POS Summary API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/frontdesk/pos-summary');
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ POS summary API working');
      console.log(`   Date: ${data.data.date}`);
      console.log(`   Total revenue: $${data.data.total_revenue || 0}`);
      console.log(`   Total transactions: ${data.data.total_transactions || 0}`);
      return true;
    } else {
      console.log('❌ POS summary API failed');
      console.log('   Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ POS summary API error:', error.message);
    return false;
  }
}

// Run all API tests
async function runAPITests() {
  console.log('🚀 Starting API Integration Tests...');
  
  const planId = await testMembershipPlansAPI();
  const memberCreated = await testMemberCreationAPI(planId);
  const posSummaryWorking = await testPOSSummaryAPI();
  
  console.log('\n🎯 API Integration Test Summary:');
  console.log(`- Membership plans API: ${planId ? '✅ Working' : '❌ Failed'}`);
  console.log(`- Member creation API: ${memberCreated ? '✅ Working' : '❌ Failed'}`);
  console.log(`- POS summary API: ${posSummaryWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (planId && memberCreated && posSummaryWorking) {
    console.log('\n🎉 All API endpoints are working correctly!');
  } else {
    console.log('\n⚠️  Some API endpoints have issues that need to be addressed.');
  }
}

// Run the tests
runAPITests().catch(console.error);
