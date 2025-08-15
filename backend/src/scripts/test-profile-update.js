import { query } from '../database.js';

const testProfileUpdate = async () => {
  try {
    console.log('Testing profile update...\n');
    
    // First, check current data
    console.log('Current data:');
    const currentData = await query(`
      SELECT specialization, certification, bio, experience_years, hourly_rate
      FROM trainers 
      WHERE id = 3
    `);
    
    if (currentData.rows.length > 0) {
      const current = currentData.rows[0];
      console.log(`Specialization: ${JSON.stringify(current.specialization)}`);
      console.log(`Certification: ${JSON.stringify(current.certification)}`);
      console.log(`Bio: ${current.bio}`);
      console.log(`Experience Years: ${current.experience_years}`);
      console.log(`Hourly Rate: ${current.hourly_rate}`);
    }
    
    // Test update with sample data
    console.log('\nUpdating profile...');
    const testSpecialization = ['Personal Training', 'Strength Training', 'Cardio'];
    const testCertification = ['NASM Certified Personal Trainer', 'First Aid Certified'];
    const testBio = 'Experienced personal trainer specializing in strength and cardio training';
    
    const updateResult = await query(`
      UPDATE trainers 
      SET 
        specialization = $1,
        certification = $2,
        bio = $3,
        experience_years = 3,
        hourly_rate = 1200
      WHERE id = 3
      RETURNING *
    `, [testSpecialization, testCertification, testBio]);
    
    if (updateResult.rows.length > 0) {
      console.log('Update successful!');
      const updated = updateResult.rows[0];
      console.log(`Updated Specialization: ${JSON.stringify(updated.specialization)}`);
      console.log(`Updated Certification: ${JSON.stringify(updated.certification)}`);
      console.log(`Updated Bio: ${updated.bio}`);
      console.log(`Updated Experience Years: ${updated.experience_years}`);
      console.log(`Updated Hourly Rate: ${updated.hourly_rate}`);
    } else {
      console.log('Update failed - no rows affected');
    }
    
    // Verify the update
    console.log('\nVerifying update...');
    const verifyData = await query(`
      SELECT specialization, certification, bio, experience_years, hourly_rate
      FROM trainers 
      WHERE id = 3
    `);
    
    if (verifyData.rows.length > 0) {
      const verified = verifyData.rows[0];
      console.log(`Verified Specialization: ${JSON.stringify(verified.specialization)}`);
      console.log(`Verified Certification: ${JSON.stringify(verified.certification)}`);
      console.log(`Verified Bio: ${verified.bio}`);
      console.log(`Verified Experience Years: ${verified.experience_years}`);
      console.log(`Verified Hourly Rate: ${verified.hourly_rate}`);
    }
    
  } catch (error) {
    console.error('Error testing profile update:', error);
  } finally {
    process.exit(0);
  }
};

testProfileUpdate();
