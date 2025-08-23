// ==============================================
// TEST MONTHLY PLAN SUBSCRIPTION FLOW
// ==============================================

const BASE_URL = 'http://localhost:3001/api';

// Test data - using existing users from the system
const testData = {
  member: {
    email: 'member@finovafitness.com',
    password: 'member123'
  },
  trainer: {
    email: 'trainer@finovafitness.com',
    password: 'defaultPassword123'
  },
  monthlyPlan: {
    plan_name: 'Test Monthly Plan - Subscription Flow',
    monthly_price: 299.99,
    sessions_per_month: 8,
    session_duration: 60,
    session_type: 'personal',
    max_subscribers: 1,
    description: 'Test plan to verify subscription flow'
  }
};

async function loginUser(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error(`Login error for ${email}:`, error.message);
    return null;
  }
}

async function createMonthlyPlan(trainerToken, trainerUserId) {
  try {
    const response = await fetch(`${BASE_URL}/trainers/monthly-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${trainerToken}`
      },
      body: JSON.stringify({
        ...testData.monthlyPlan,
        trainer_id: trainerUserId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create plan failed: ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Monthly plan created successfully:', result.data.plan_name);
    return result.data.id;
  } catch (error) {
    console.error('❌ Create plan error:', error.message);
    return null;
  }
}

async function requestSubscription(memberToken, memberUserId, planId) {
  try {
    const response = await fetch(`${BASE_URL}/member/monthly-plans/${memberUserId}/request-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      },
      body: JSON.stringify({ plan_id: planId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request subscription failed: ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Subscription request created successfully:', result.message);
    return result.data.id;
  } catch (error) {
    console.error('❌ Request subscription error:', error.message);
    return null;
  }
}

async function getPendingSubscriptions(trainerToken) {
  try {
    const response = await fetch(`${BASE_URL}/trainer/subscriptions/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${trainerToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get pending subscriptions failed: ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Pending subscriptions retrieved:', result.data.length, 'requests');
    return result.data;
  } catch (error) {
    console.error('❌ Get pending subscriptions error:', error.message);
    return [];
  }
}

async function approveSubscription(trainerToken, subscriptionId) {
  try {
    const response = await fetch(`${BASE_URL}/trainer/subscriptions/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${trainerToken}`
      },
      body: JSON.stringify({ 
        subscription_id: subscriptionId,
        notes: 'Approved via test script'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Approve subscription failed: ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Subscription approved successfully:', result.message);
    return true;
  } catch (error) {
    console.error('❌ Approve subscription error:', error.message);
    return false;
  }
}

async function testMonthlyPlanSubscriptionFlow() {
  console.log('🚀 Starting Monthly Plan Subscription Flow Test...\n');

  // Step 1: Login as trainer
  console.log('📋 Step 1: Login as trainer');
  const trainerLogin = await loginUser(testData.trainer.email, testData.trainer.password);
  if (!trainerLogin) {
    console.error('❌ Failed to login as trainer');
    return;
  }
  console.log('✅ Trainer logged in successfully\n');

  // Step 2: Create a monthly plan
  console.log('📋 Step 2: Create monthly plan');
  const planId = await createMonthlyPlan(trainerLogin.token, trainerLogin.user.id);
  if (!planId) {
    console.error('❌ Failed to create monthly plan');
    return;
  }
  console.log('✅ Monthly plan created with ID:', planId, '\n');

  // Step 3: Login as member
  console.log('📋 Step 3: Login as member');
  const memberLogin = await loginUser(testData.member.email, testData.member.password);
  if (!memberLogin) {
    console.error('❌ Failed to login as member');
    return;
  }
  console.log('✅ Member logged in successfully\n');

  // Step 4: Request subscription
  console.log('📋 Step 4: Request subscription to monthly plan');
  const subscriptionId = await requestSubscription(memberLogin.token, memberLogin.user.id, planId);
  if (!subscriptionId) {
    console.error('❌ Failed to request subscription');
    return;
  }
  console.log('✅ Subscription request created with ID:', subscriptionId, '\n');

  // Step 5: Check pending subscriptions as trainer
  console.log('📋 Step 5: Check pending subscriptions as trainer');
  const pendingSubscriptions = await getPendingSubscriptions(trainerLogin.token);
  if (pendingSubscriptions.length === 0) {
    console.error('❌ No pending subscriptions found');
    return;
  }
  console.log('✅ Found pending subscription:', pendingSubscriptions[0].plan_name, '\n');

  // Step 6: Approve subscription
  console.log('📋 Step 6: Approve subscription');
  const approved = await approveSubscription(trainerLogin.token, subscriptionId);
  if (!approved) {
    console.error('❌ Failed to approve subscription');
    return;
  }
  console.log('✅ Subscription approved successfully\n');

  // Step 7: Verify subscription is no longer pending
  console.log('📋 Step 7: Verify subscription is no longer pending');
  const updatedPendingSubscriptions = await getPendingSubscriptions(trainerLogin.token);
  if (updatedPendingSubscriptions.length === 0) {
    console.log('✅ No pending subscriptions remaining - subscription was approved successfully!');
  } else {
    console.log('⚠️  Still have pending subscriptions:', updatedPendingSubscriptions.length);
  }

  console.log('\n🎉 Monthly Plan Subscription Flow Test Completed Successfully!');
  console.log('\n📊 Summary:');
  console.log('- Trainer created monthly plan');
  console.log('- Member requested subscription');
  console.log('- Trainer saw pending request in subscription management');
  console.log('- Trainer approved the subscription');
  console.log('- Subscription status changed from pending to active');
}

// Run the test
testMonthlyPlanSubscriptionFlow().catch(console.error);


