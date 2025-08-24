import { query } from './src/database.js';

async function checkTableStructure() {
  try {
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'gym_visits' 
      ORDER BY ordinal_position
    `);
    
    console.log('Gym visits table structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure();
