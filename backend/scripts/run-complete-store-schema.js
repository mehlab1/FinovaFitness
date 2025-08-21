const fs = require('fs');
const path = require('path');
const { query } = require('../src/database.js');

async function runCompleteStoreSchema() {
  try {
    console.log('🗄️  Running complete store schema...');
    
    // Read the complete schema file
    const schemaPath = path.join(__dirname, '../complete-store-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await query(schema);
    
    console.log('✅ Complete store schema executed successfully!');
    console.log('🔍 This includes: reviews, wishlists, promotions, and all missing tables');
    
    // Verify the tables were created
    const result = await query(`
      SELECT 
        table_name,
        CASE 
          WHEN table_name IS NOT NULL THEN '✅ Created'
          ELSE '❌ Missing'
        END as status
      FROM (
        VALUES 
          ('store_categories'),
          ('store_items'),
          ('store_carts'),
          ('store_cart_items'),
          ('store_orders'),
          ('store_order_items'),
          ('store_order_status_history'),
          ('store_inventory_transactions'),
          ('store_reviews'),
          ('store_wishlists'),
          ('store_promotions')
      ) AS expected_tables(table_name)
      LEFT JOIN information_schema.tables ist 
        ON ist.table_name = expected_tables.table_name 
        AND ist.table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Table Creation Status:');
    result.rows.forEach(row => {
      console.log(`  ${row.status} ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error running complete store schema:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runCompleteStoreSchema()
    .then(() => {
      console.log('\n🎉 Store schema migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Store schema migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runCompleteStoreSchema };
