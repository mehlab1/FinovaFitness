import { query } from './database.js';

const testWeightChange = async () => {
  try {
    console.log('Testing weight change calculation for Mehlab...');
    
    const result = await query(`
      SELECT 
        w1.weight as current_weight,
        w2.weight as previous_weight
      FROM weight_tracking w1
      LEFT JOIN weight_tracking w2 ON w2.user_id = w1.user_id 
        AND w2.recorded_date < w1.recorded_date
        AND w2.recorded_date = (
          SELECT MAX(recorded_date) 
          FROM weight_tracking w3 
          WHERE w3.user_id = w1.user_id 
          AND w3.recorded_date < w1.recorded_date
        )
      WHERE w1.user_id = 10 
      AND w1.recorded_date = (
        SELECT MAX(recorded_date) 
        FROM weight_tracking 
        WHERE user_id = 10
      )
    `);
    
    console.log('Weight change data:', result.rows[0]);
    
    if (result.rows[0]?.current_weight && result.rows[0]?.previous_weight) {
      const change = (result.rows[0].current_weight - result.rows[0].previous_weight).toFixed(1);
      console.log('Weight change:', change, 'kg');
    } else {
      console.log('No weight change data available');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testWeightChange();
