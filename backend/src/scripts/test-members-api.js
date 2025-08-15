import { query } from '../database.js';

const testMembersAPI = async () => {
  try {
    console.log('Testing members API endpoint...\n');
    
    // Simulate the exact query from the members route
    const result = await query(
      `SELECT 
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
         u.email,
         COALESCE(AVG(tr.rating), 0) as average_rating,
         COUNT(tr.id) as total_ratings
       FROM trainers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN trainer_ratings tr ON t.id = tr.trainer_id
       WHERE u.is_active = true
       GROUP BY t.id, t.user_id, t.specialization, t.certification, t.experience_years, t.bio, t.hourly_rate, t.profile_image, u.first_name, u.last_name, u.email
       ORDER BY average_rating DESC, total_ratings DESC`
    );
    
    console.log('Members API response:');
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
      console.log(`Average Rating: ${trainer.average_rating}`);
      console.log(`Total Ratings: ${trainer.total_ratings}`);
    });
    
  } catch (error) {
    console.error('Error testing members API:', error);
  } finally {
    process.exit(0);
  }
};

testMembersAPI();
