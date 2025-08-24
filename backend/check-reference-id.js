import { query } from './src/database.js';

async function checkReferenceId() {
  try {
    console.log('🔍 Checking reference_id column...\n');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'loyalty_transactions' 
      AND column_name = 'reference_id'
    `);
    
    console.log('reference_id column details:');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error checking reference_id:', error.message);
  }
}

checkReferenceId();
