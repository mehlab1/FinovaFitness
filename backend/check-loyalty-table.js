import { query } from './src/database.js';

async function checkLoyaltyTable() {
  try {
    console.log('🔍 Checking loyalty_transactions table...\n');
    
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'loyalty_transactions'
      )
    `);
    
    console.log(`loyalty_transactions table exists: ${result.rows[0].exists}`);
    
    if (result.rows[0].exists) {
      const structure = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'loyalty_transactions'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 loyalty_transactions table structure:');
      structure.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('❌ loyalty_transactions table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking loyalty table:', error.message);
  }
}

checkLoyaltyTable();
