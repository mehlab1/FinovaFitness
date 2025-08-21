import { query } from '../src/database.js';

async function checkStoreTables() {
  try {
    console.log('🔍 Checking existing store-related tables...');
    
    // Get all tables that start with 'store_'
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'store_%'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Existing store tables:');
    for (const table of tablesResult.rows) {
      console.log(`  ✅ ${table.table_name}`);
    }
    
    // Get columns for each store table
    for (const table of tablesResult.rows) {
      const columnsResult = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [table.table_name]);
      
      console.log(`\n🔧 Columns in ${table.table_name}:`);
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`    ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run if this file is executed directly
checkStoreTables()
  .then(() => {
    console.log('\n✅ Store tables check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Store tables check failed:', error);
    process.exit(1);
  });

export { checkStoreTables };
