import { query } from '../database.js';

const checkTrainerData = async () => {
  try {
    console.log('Checking trainer data...\n');
    
    // Check all trainers
    const result = await query(`
      SELECT 
        t.id,
        t.user_id,
        t.specialization,
        t.certification,
        t.experience_years,
        t.bio,
        t.hourly_rate,
        t.profile_image,
        u.first_name,
        u.last_name,
        u.email
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.id
    `);
    
    console.log('Trainer data:');
    result.rows.forEach((trainer, index) => {
      console.log(`\n--- Trainer ${index + 1} ---`);
      console.log(`ID: ${trainer.id}`);
      console.log(`Name: ${trainer.first_name} ${trainer.last_name}`);
      console.log(`Email: ${trainer.email}`);
      console.log(`Specialization: ${JSON.stringify(trainer.specialization)}`);
      console.log(`Certification: ${JSON.stringify(trainer.certification)}`);
      console.log(`Experience Years: ${trainer.experience_years}`);
      console.log(`Bio: ${trainer.bio || 'No bio'}`);
      console.log(`Hourly Rate: ${trainer.hourly_rate}`);
      console.log(`Profile Image: ${trainer.profile_image || 'No image'}`);
    });
    
    // Check specific trainer (Muhammad Jamshed)
    const specificTrainer = await query(`
      SELECT 
        t.*,
        u.first_name,
        u.last_name
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      WHERE u.first_name = 'Muhammad' AND u.last_name = 'Jamshed'
    `);
    
    if (specificTrainer.rows.length > 0) {
      console.log('\n\n--- Specific Trainer (Muhammad Jamshed) ---');
      const trainer = specificTrainer.rows[0];
      console.log(`Specialization: ${JSON.stringify(trainer.specialization)}`);
      console.log(`Certification: ${JSON.stringify(trainer.certification)}`);
      console.log(`Bio: ${trainer.bio || 'No bio'}`);
    } else {
      console.log('\n\nTrainer Muhammad Jamshed not found');
    }
    
  } catch (error) {
    console.error('Error checking trainer data:', error);
  } finally {
    process.exit(0);
  }
};

checkTrainerData();
