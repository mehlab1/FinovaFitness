import { query } from './src/database.js';

async function checkMemberProfilesTable() {
  try {
    console.log('🔍 Checking member_profiles table structure...\n');
    
    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'member_profiles'
      );
    `;
    
    const tableExistsResult = await query(tableExistsQuery);
    const tableExists = tableExistsResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('❌ member_profiles table does not exist!');
      console.log('\n📋 Available tables:');
      
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      const tablesResult = await query(tablesQuery);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
      return;
    }
    
    console.log('✅ member_profiles table exists');
    
    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'member_profiles'
      ORDER BY ordinal_position
    `;
    
    const structureResult = await query(structureQuery);
    
    console.log('\n📋 member_profiles table structure:');
    structureResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check sample data
    const sampleDataQuery = `
      SELECT * FROM member_profiles LIMIT 3
    `;
    
    const sampleDataResult = await query(sampleDataQuery);
    
    console.log(`\n📊 Sample data (${sampleDataResult.rows.length} rows):`);
    sampleDataResult.rows.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, row);
    });
    
  } catch (error) {
    console.error('❌ Error checking member_profiles table:', error);
  } finally {
    process.exit(0);
  }
}

checkMemberProfilesTable();
