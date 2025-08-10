import { query } from './config/database.js';

async function createWeightTrackingSample() {
  try {
    console.log('Creating sample weight tracking data for mehlab user...');
    
    // Get the mehlab user specifically (ID 10)
    const userResult = await query(
      'SELECT id, first_name, last_name FROM users WHERE id = 10 AND role = \'member\''
    );
    
    if (userResult.rows.length === 0) {
      console.log('Mehlab user (ID 10) not found. Please create the mehlab user first.');
      return;
    }
    
    const userId = userResult.rows[0].id;
    const userName = `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`;
    console.log(`Using user: ${userName} (ID: ${userId})`);
    
    // Check if weight tracking data already exists for this user
    const existingData = await query(
      'SELECT COUNT(*) as count FROM weight_tracking WHERE user_id = $1',
      [userId]
    );
    
    if (existingData.rows[0].count > 0) {
      console.log(`Weight tracking data already exists for ${userName} (${existingData.rows[0].count} entries)`);
      return;
    }
    
    // Insert sample weight tracking data for mehlab
    const sampleData = [
      {
        user_id: userId,
        weight: 75.5,
        height: 165.0, // Using the height from member profile (165cm)
        recorded_date: '2024-01-01',
        notes: 'New Year starting weight'
      },
      {
        user_id: userId,
        weight: 74.8,
        height: 165.0,
        recorded_date: '2024-01-15',
        notes: 'Mid-month check-in'
      },
      {
        user_id: userId,
        weight: 73.2,
        height: 165.0,
        recorded_date: '2024-02-01',
        notes: 'February check-in'
      },
      {
        user_id: userId,
        weight: 72.5,
        height: 165.0,
        recorded_date: '2024-02-15',
        notes: 'Mid-month check-in'
      },
      {
        user_id: userId,
        weight: 71.8,
        height: 165.0,
        recorded_date: '2024-03-01',
        notes: 'March check-in'
      }
    ];
    
    for (const data of sampleData) {
      await query(
        `INSERT INTO weight_tracking (user_id, weight, height, recorded_date, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.user_id, data.weight, data.height, data.recorded_date, data.notes]
      );
    }
    
    console.log('Sample weight tracking data created successfully for mehlab!');
    console.log('Weight progression: 75.5kg → 74.8kg → 73.2kg → 72.5kg → 71.8kg');
    console.log('Total weight loss: 3.7kg');
    console.log('Height: 165cm');
    console.log('Latest BMI: 26.4 (71.8kg / 1.65m²)');
    
  } catch (error) {
    console.error('Error creating weight tracking sample:', error);
  } finally {
    process.exit(0);
  }
}

createWeightTrackingSample();
