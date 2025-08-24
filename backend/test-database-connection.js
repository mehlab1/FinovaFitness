import { query } from './src/database.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...\\n');
    
    // Test 1: Simple query
    console.log('1. Testing simple query...');
    const simpleResult = await query('SELECT NOW() as current_time');
    console.log('✅ Simple query successful:', simpleResult.rows[0]);
    
    // Test 2: Test the exact query from searchActiveMembers
    console.log('\\n2. Testing searchActiveMembers query...');
    const searchQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        mp.subscription_status as membership_status,
        mp.loyalty_points,
        mp.membership_start_date,
        mp.membership_end_date
      FROM users u
      INNER JOIN member_profiles mp ON u.id = mp.user_id
      WHERE 
        u.is_active = true
        AND mp.subscription_status = 'active'
        AND (
          LOWER(u.first_name) LIKE LOWER($1) OR
          LOWER(u.last_name) LIKE LOWER($1) OR
          LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER($1) OR
          LOWER(u.email) LIKE LOWER($1) OR
          CAST(u.id AS TEXT) = $1
        )
      ORDER BY 
        CASE 
          WHEN LOWER(u.first_name) = LOWER($1) THEN 1
          WHEN LOWER(u.last_name) = LOWER($1) THEN 2
          WHEN LOWER(u.email) = LOWER($1) THEN 3
          WHEN CAST(u.id AS TEXT) = $1 THEN 4
          ELSE 5
        END,
        u.first_name, u.last_name
      LIMIT $2
    `;
    
    const searchPattern = '%test%';
    const searchResult = await query(searchQuery, [searchPattern, 10]);
    console.log('✅ Search query successful:', searchResult.rows.length, 'results');
    
    // Test 3: Test with multiple connections
    console.log('\\n3. Testing multiple concurrent queries...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(query('SELECT $1 as test_number', [i]));
    }
    
    const concurrentResults = await Promise.all(promises);
    console.log('✅ Concurrent queries successful:', concurrentResults.length, 'results');
    
    // Test 4: Test transaction
    console.log('\\n4. Testing transaction...');
    const { getClient } = await import('./src/database.js');
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      const txResult = await client.query('SELECT NOW() as tx_time');
      await client.query('COMMIT');
      console.log('✅ Transaction successful:', txResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    console.log('\\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  }
}

testDatabaseConnection();
