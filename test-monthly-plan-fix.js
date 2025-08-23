// Using built-in fetch (available in Node.js 18+)

const BASE_URL = 'http://localhost:3001/api';

// Test data - using existing users from the system
const testData = {
  trainer: {
    email: 'trainer@finovafitness.com', // Using correct trainer email
    password: 'defaultPassword123'
  },
  admin: {
    email: 'admin@finovafitness.com', // Using correct admin email
    password: 'admin123'
  },
  monthlyPlan: {
    trainer_id: 2, // This will be the user_id for john_doe trainer
    plan_name: 'Test Monthly Plan - Fixed',
    monthly_price: 299.99,
    sessions_per_month: 8,
    session_duration: 60,
    session_type: 'personal',
    max_subscribers: 1,
    description: 'Test plan to verify the fix'
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
      throw new Error(`Login failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error(`Login error for ${email}:`, error.message);
    return null;
  }
}

async function createMonthlyPlan(token, planData) {
  try {
    const response = await fetch(`${BASE_URL}/monthly-plans/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create plan failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create plan error:', error.message);
    return null;
  }
}

async function getPendingPlans(token) {
  try {
    const response = await fetch(`${BASE_URL}/admin/monthly-plans/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get pending plans failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get pending plans error:', error.message);
    return null;
  }
}

async function approvePlan(token, planId, adminId) {
  try {
    const response = await fetch(`${BASE_URL}/admin/monthly-plans/${planId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        admin_id: adminId,
        comments: 'Test approval'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Approve plan failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Approve plan error:', error.message);
    return null;
  }
}

async function testMonthlyPlanFlow() {
  console.log('🚀 Testing Monthly Plan Creation and Approval Flow...\n');

  // Step 1: Login as trainer
  console.log('1. Logging in as trainer...');
  const trainerToken = await loginUser(testData.trainer.email, testData.trainer.password);
  if (!trainerToken) {
    console.error('❌ Failed to login as trainer');
    return;
  }
  console.log('✅ Trainer logged in successfully\n');

  // Step 2: Create a monthly plan
  console.log('2. Creating monthly plan...');
  const planResult = await createMonthlyPlan(trainerToken, testData.monthlyPlan);
  if (!planResult) {
    console.error('❌ Failed to create monthly plan');
    return;
  }
  console.log('✅ Monthly plan created successfully');
  console.log(`   Plan ID: ${planResult.data.id}`);
  console.log(`   Plan Name: ${planResult.data.plan_name}`);
  console.log(`   Status: ${planResult.data.admin_approved === null ? 'Pending Approval' : 'Already Processed'}\n`);

  // Step 3: Login as admin
  console.log('3. Logging in as admin...');
  const adminToken = await loginUser(testData.admin.email, testData.admin.password);
  if (!adminToken) {
    console.error('❌ Failed to login as admin');
    return;
  }
  console.log('✅ Admin logged in successfully\n');

  // Step 4: Check pending plans
  console.log('4. Checking pending plans...');
  const pendingPlans = await getPendingPlans(adminToken);
  if (!pendingPlans) {
    console.error('❌ Failed to get pending plans');
    return;
  }
  console.log(`✅ Found ${pendingPlans.data.length} pending plans`);
  
  if (pendingPlans.data.length > 0) {
    console.log('   Pending plans:');
    pendingPlans.data.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.plan_name} by ${plan.trainer_first_name} ${plan.trainer_last_name}`);
    });
    console.log();

    // Step 5: Approve the first pending plan
    const planToApprove = pendingPlans.data[0];
    console.log(`5. Approving plan: ${planToApprove.plan_name}...`);
    const approveResult = await approvePlan(adminToken, planToApprove.id, 1); // admin_id = 1
    if (!approveResult) {
      console.error('❌ Failed to approve plan');
      return;
    }
    console.log('✅ Plan approved successfully');
    console.log(`   Approval message: ${approveResult.message}\n`);

    // Step 6: Check pending plans again
    console.log('6. Checking pending plans after approval...');
    const pendingPlansAfter = await getPendingPlans(adminToken);
    if (!pendingPlansAfter) {
      console.error('❌ Failed to get pending plans after approval');
      return;
    }
    console.log(`✅ Found ${pendingPlansAfter.data.length} pending plans after approval`);
  } else {
    console.log('⚠️  No pending plans found');
  }

  console.log('\n🎉 Monthly Plan Flow Test Completed!');
}

// Run the test
testMonthlyPlanFlow().catch(console.error);
