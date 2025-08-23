import { query } from './src/database.js';

// Test script for monthly plan system
async function testMonthlyPlanSystem() {
  try {
    console.log('🧪 Testing Monthly Plan System...\n');

    // 1. Check if we have trainers
    console.log('1. Checking for existing trainers...');
    const trainers = await query(`
      SELECT t.id, t.user_id, u.first_name, u.last_name, u.email
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      LIMIT 5
    `);
    
    console.log(`Found ${trainers.rows.length} trainers`);
    trainers.rows.forEach(trainer => {
      console.log(`  - ${trainer.first_name} ${trainer.last_name} (ID: ${trainer.id})`);
    });

    if (trainers.rows.length === 0) {
      console.log('❌ No trainers found. Please create some trainers first.');
      return;
    }

    // 2. Check existing monthly plans
    console.log('\n2. Checking existing monthly plans...');
    const existingPlans = await query(`
      SELECT tmp.*, u.first_name, u.last_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      ORDER BY tmp.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${existingPlans.rows.length} existing monthly plans`);
    existingPlans.rows.forEach(plan => {
      console.log(`  - ${plan.plan_name} by ${plan.first_name} ${plan.last_name} (Status: ${plan.admin_approved === null ? 'Pending' : plan.admin_approved ? 'Approved' : 'Rejected'})`);
    });

    // 3. Create a new monthly plan for testing
    console.log('\n3. Creating a new monthly plan for testing...');
    const trainerId = trainers.rows[0].id;
    
    const newPlan = await query(`
      INSERT INTO trainer_monthly_plans (
        trainer_id, plan_name, monthly_price, sessions_per_month,
        session_duration, session_type, max_subscribers, description,
        requires_admin_approval, admin_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      trainerId,
      'Test Monthly Plan',
      150.00,
      8,
      60,
      'personal',
      5,
      'A comprehensive monthly training plan for testing purposes',
      true,
      null
    ]);

    console.log(`✅ Created new plan: ${newPlan.rows[0].plan_name} (ID: ${newPlan.rows[0].id})`);

    // 4. Check pending plans
    console.log('\n4. Checking pending plans...');
    const pendingPlans = await query(`
      SELECT 
        tmp.*,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.requires_admin_approval = true 
        AND tmp.admin_approved IS NULL
        AND tmp.is_active = true
      ORDER BY tmp.created_at ASC
    `);
    
    console.log(`Found ${pendingPlans.rows.length} pending plans`);
    pendingPlans.rows.forEach(plan => {
      console.log(`  - ${plan.plan_name} by ${plan.trainer_first_name} ${plan.trainer_last_name} (ID: ${plan.id})`);
    });

    // 5. Test approval (simulate admin approval)
    if (pendingPlans.rows.length > 0) {
      console.log('\n5. Testing plan approval...');
      const planToApprove = pendingPlans.rows[0];
      
      const approvedPlan = await query(`
        UPDATE trainer_monthly_plans 
        SET admin_approved = true,
            admin_approval_date = CURRENT_TIMESTAMP,
            admin_approval_notes = 'Approved for testing purposes',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [planToApprove.id]);

      console.log(`✅ Approved plan: ${approvedPlan.rows[0].plan_name}`);
    }

    // 6. Check approved plans
    console.log('\n6. Checking approved plans...');
    const approvedPlans = await query(`
      SELECT 
        tmp.*,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.admin_approved = true 
        AND tmp.is_active = true
      ORDER BY tmp.admin_approval_date DESC
    `);
    
    console.log(`Found ${approvedPlans.rows.length} approved plans`);
    approvedPlans.rows.forEach(plan => {
      console.log(`  - ${plan.plan_name} by ${plan.trainer_first_name} ${plan.trainer_last_name} (Approved: ${plan.admin_approval_date})`);
    });

    // 7. Test statistics
    console.log('\n7. Testing statistics...');
    const stats = await query(`
      SELECT 
        COUNT(*) as total_plans,
        COUNT(CASE WHEN requires_admin_approval = true AND admin_approved IS NULL THEN 1 END) as pending_plans,
        COUNT(CASE WHEN admin_approved = true THEN 1 END) as approved_plans,
        COUNT(CASE WHEN admin_approved = false THEN 1 END) as rejected_plans
      FROM trainer_monthly_plans 
      WHERE is_active = true
    `);
    
    const statsData = stats.rows[0];
    console.log('📊 Monthly Plan Statistics:');
    console.log(`  - Total Plans: ${statsData.total_plans}`);
    console.log(`  - Pending Plans: ${statsData.pending_plans}`);
    console.log(`  - Approved Plans: ${statsData.approved_plans}`);
    console.log(`  - Rejected Plans: ${statsData.rejected_plans}`);

    console.log('\n✅ Monthly Plan System Test Completed Successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the frontend application');
    console.log('2. Login as admin user');
    console.log('3. Navigate to "Monthly Plan Approval" section');
    console.log('4. Test the approval/rejection functionality');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMonthlyPlanSystem();
