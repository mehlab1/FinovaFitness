import { query, getClient } from '../database.js';
import fs from 'fs';
import path from 'path';

const initializeMemberBalance = async () => {
  try {
    console.log('🚀 Starting member balance system initialization...');
    
    const client = await getClient();
    
    try {
      // Read the SQL schema file
      const schemaPath = path.join(process.cwd(), 'src', 'database', 'schemas', 'member-balance.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the schema
      await client.query(schemaSQL);
      
      console.log('✅ Member balance tables created successfully');
      
      // Verify tables were created
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('member_balance', 'member_balance_transactions', 'plan_change_requests')
        ORDER BY table_name
      `);
      
      console.log('📋 Created tables:', tablesResult.rows.map(row => row.table_name));
      
    } catch (error) {
      console.error('❌ Error during schema execution:', error);
      throw error;
    } finally {
      client.release();
    }
    
    console.log('🎉 Member balance system initialization completed!');
    
  } catch (error) {
    console.error('❌ Failed to initialize member balance system:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeMemberBalance();
}

export default initializeMemberBalance;
