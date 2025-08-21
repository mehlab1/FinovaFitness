import { query } from '../src/database.js';

async function checkLoyaltyConstraints() {
  try {
    console.log('🔍 Checking loyalty_transactions table constraints...');
    
    // Get the constraint definition
    const constraintResult = await query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'loyalty_transactions' 
        AND tc.constraint_type = 'CHECK'
        AND tc.constraint_name LIKE '%transaction_type%';
    `);
    
    console.log('\n📋 Constraint details:');
    constraintResult.rows.forEach(row => {
      console.log(`  Constraint: ${row.constraint_name}`);
      console.log(`  Check clause: ${row.check_clause}`);
    });
    
    // Also check the table structure
    const columnsResult = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'loyalty_transactions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n🔧 Columns in loyalty_transactions:');
    columnsResult.rows.forEach(col => {
      console.log(`    ${col.column_name}: ${col.data_type} DEFAULT ${col.column_default || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the check
checkLoyaltyConstraints()
  .then(() => {
    console.log('\n✅ Loyalty constraints check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Loyalty constraints check failed:', error);
    process.exit(1);
  });

export { checkLoyaltyConstraints };
