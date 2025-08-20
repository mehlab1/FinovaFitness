import { query, getClient } from '../src/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runStoreSchema() {
  const client = await getClient();
  
  try {
    console.log('🚀 Starting store schema migration...');
    
    // Read the store schema file
    const schemaPath = path.join(__dirname, '../src/database/schemas/store-schema-basic.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading store schema file...');
    
    // Split the SQL into individual statements and filter out comments
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === '42P07') {
            // Table already exists, skip
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else if (error.code === '42P01') {
            // Relation doesn't exist yet, this might be a dependency issue
            console.log(`⚠️  Statement ${i + 1} skipped (dependency issue): ${error.message}`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Store schema migration completed successfully!');
    
    // Verify the tables were created
    console.log('\n🔍 Verifying created tables...');
    
    const tablesToCheck = [
      'store_categories',
      'store_items', 
      'store_carts',
      'store_cart_items',
      'store_orders',
      'store_order_items',
      'store_order_status_history',
      'store_inventory_transactions'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = $1
        `, [table]);
        
        if (result.rows[0].count > 0) {
          console.log(`✅ Table ${table} exists`);
        } else {
          console.log(`❌ Table ${table} not found`);
        }
      } catch (error) {
        console.log(`❌ Error checking table ${table}:`, error.message);
      }
    }
    
    // Check default categories
    console.log('\n🔍 Checking default categories...');
    const categoriesResult = await client.query('SELECT * FROM store_categories');
    console.log(`📦 Found ${categoriesResult.rows.length} categories:`);
    categoriesResult.rows.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.description}`);
    });
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStoreSchema()
    .then(() => {
      console.log('🎯 Store schema setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Store schema setup failed:', error);
      process.exit(1);
    });
}

export default runStoreSchema;
