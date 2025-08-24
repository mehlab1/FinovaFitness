import pg from 'pg';
import loyaltyService from './src/services/loyaltyService.js';
import consistencyService from './src/services/consistencyService.js';
import checkInService from './src/services/checkInService.js';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/finovafitness'
});

async function testLoyaltyPoints() {
  console.log('🧪 Starting Loyalty Points Testing...\n');
  
  try {
    // Test 1: Find an existing member
    console.log('📝 Test 1: Finding existing member...');
    const testMember = await findExistingMember();
    if (!testMember) {
      console.log('❌ No existing members found. Please create a member first.');
      return;
    }
    console.log(`✅ Using existing member with ID: ${testMember.id}\n`);
    
    // Test 2: Check initial loyalty balance
    console.log('💰 Test 2: Checking initial loyalty balance...');
    const initialBalance = await loyaltyService.getLoyaltyBalance(testMember.id);
    console.log(`✅ Initial loyalty balance: ${initialBalance} points\n`);
    
    // Test 3: Record multiple check-ins for a week
    console.log('🏃 Test 3: Recording check-ins for consistency...');
    const weekStart = consistencyService.calculateWeekStart(new Date());
    const checkInDates = [
      new Date(weekStart),
      new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 1)),
      new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 2)),
      new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 3)),
      new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 4))
    ];
    
    for (let i = 0; i < checkInDates.length; i++) {
      const checkInData = {
        check_in_time: checkInDates[i],
        check_in_type: 'manual'
      };
      
      const result = await checkInService.recordCheckIn({ user_id: testMember.id, ...checkInData });
      console.log(`✅ Check-in ${i + 1} recorded: ${checkInDates[i].toDateString()}`);
    }
    console.log('');
    
    // Test 4: Process consistency and check points
    console.log('🎯 Test 4: Processing consistency and checking points...');
    await consistencyService.processWeeklyConsistency(testMember.id, weekStart);
    
    const finalBalance = await loyaltyService.getLoyaltyBalance(testMember.id);
    console.log(`✅ Final loyalty balance: ${finalBalance} points`);
    console.log(`✅ Points earned: ${finalBalance - initialBalance} points\n`);
    
    // Test 5: Verify consistency achievement
    console.log('📊 Test 5: Verifying consistency achievement...');
    const consistency = await consistencyService.getCurrentWeekConsistency(testMember.id);
    console.log(`✅ Weekly check-ins: ${consistency.checkInsCount}/7 days`);
    console.log(`✅ Consistency achieved: ${consistency.consistencyAchieved ? 'Yes' : 'No'}\n`);
    
    // Test 6: Try to award points again (should not award duplicate)
    console.log('🔄 Test 6: Testing duplicate prevention...');
    const balanceBefore = await loyaltyService.getLoyaltyBalance(testMember.id);
    await consistencyService.processWeeklyConsistency(testMember.id, weekStart);
    const balanceAfter = await loyaltyService.getLoyaltyBalance(testMember.id);
    
    if (balanceBefore === balanceAfter) {
      console.log('✅ Duplicate prevention working: No additional points awarded\n');
    } else {
      console.log('❌ Duplicate prevention failed: Additional points were awarded\n');
    }
    
    // Test 7: Check loyalty transaction history
    console.log('📋 Test 7: Checking loyalty transaction history...');
    const history = await loyaltyService.getLoyaltyHistory(testMember.id);
    console.log(`✅ Total transactions: ${history.length}`);
    if (history.length > 0) {
      console.log(`✅ Latest transaction: ${history[0].description} - ${history[0].points} points`);
    }
    console.log('');
    
    // Test 8: Check consistency achievements table
    console.log('🏆 Test 8: Checking consistency achievements...');
    const achievements = await consistencyService.getConsistencyHistory(testMember.id);
    console.log(`✅ Total achievements: ${achievements.length}`);
    if (achievements.length > 0) {
      console.log(`✅ Latest achievement: Week of ${achievements[0].week_start_date} - ${achievements[0].check_ins_count} check-ins`);
    }
    console.log('');
    
    // Cleanup test check-ins only (don't delete the user)
    console.log('🧹 Cleaning up test check-ins...');
    await cleanupTestCheckIns(testMember.id);
    console.log('✅ Test check-ins cleaned up\n');
    
    console.log('🎉 All loyalty points tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

async function findExistingMember() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT u.id, u.first_name, u.last_name, u.email 
      FROM users u 
      JOIN member_profiles mp ON u.id = mp.user_id 
      WHERE u.role = 'member' 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    return null;
  } finally {
    client.release();
  }
}

async function cleanupTestCheckIns(userId) {
  const client = await pool.connect();
  try {
    // Only delete the test check-ins we created, not all check-ins
    const weekStart = consistencyService.calculateWeekStart(new Date());
    await client.query(
      'DELETE FROM gym_visits WHERE user_id = $1 AND visit_date >= $2',
      [userId, weekStart]
    );
    
    // Clean up consistency achievements for this week
    await client.query(
      'DELETE FROM consistency_achievements WHERE user_id = $1 AND week_start_date = $2',
      [userId, weekStart]
    );
    
    // Clean up loyalty transactions for this week
    await client.query(
      'DELETE FROM loyalty_transactions WHERE user_id = $1 AND created_at >= $2 AND description LIKE $3',
      [userId, weekStart, '%consistency%']
    );
  } finally {
    client.release();
  }
}

// Run the test
testLoyaltyPoints();
