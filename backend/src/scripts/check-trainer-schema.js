import { query } from '../database.js';

const checkTrainerSchema = async () => {
  try {
    console.log('Checking trainers table schema...\n');
    
    // Check table structure
    const schemaResult = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'trainers' 
      ORDER BY ordinal_position
    `);
    
    console.log('Trainers table columns:');
    schemaResult.rows.forEach((column, index) => {
      console.log(`${index + 1}. ${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable})`);
      if (column.column_default) {
        console.log(`   Default: ${column.column_default}`);
      }
    });
    
    // Check if specialization and certification columns exist
    const hasSpecialization = schemaResult.rows.some(col => col.column_name === 'specialization');
    const hasCertification = schemaResult.rows.some(col => col.column_name === 'certification');
    
    console.log(`\nSpecialization column exists: ${hasSpecialization}`);
    console.log(`Certification column exists: ${hasCertification}`);
    
    if (hasSpecialization && hasCertification) {
      // Check sample data
      const sampleData = await query(`
        SELECT specialization, certification 
        FROM trainers 
        LIMIT 3
      `);
      
      console.log('\nSample data:');
      sampleData.rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        console.log(`  Specialization: ${JSON.stringify(row.specialization)} (type: ${typeof row.specialization})`);
        console.log(`  Certification: ${JSON.stringify(row.certification)} (type: ${typeof row.certification})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
};

checkTrainerSchema();
