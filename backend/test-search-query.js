import { query } from './src/database.js';

async function testSearchQuery() {
  try {
    console.log('🔍 Testing search query directly...\n');
    
    const searchTerm = 'test';
    const limit = 10;
    
    const queryText = `
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
        mp.subscription_status = 'active'
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
    
    const searchPattern = `%${searchTerm}%`;
    console.log('Executing query with parameters:', { searchPattern, limit });
    
    const result = await query(queryText, [searchPattern, limit]);
    
    console.log('✅ Query executed successfully!');
    console.log(`Found ${result.rows.length} results:`);
    
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.first_name} ${row.last_name} (${row.email}) - Status: ${row.membership_status}`);
    });
    
  } catch (error) {
    console.error('❌ Query failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    process.exit(0);
  }
}

testSearchQuery();
