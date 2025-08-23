import { query } from './src/database.js';

async function createPendingPlan() {
  try {
    // Get the first trainer
    const trainer = await query(`
      SELECT t.id, t.user_id, u.first_name, u.last_name
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      LIMIT 1
    `);

    if (trainer.rows.length === 0) {
      console.log('❌ No trainers found');
      return;
    }

    const trainerId = trainer.rows[0].id;
    
    // Create a pending plan
    const newPlan = await query(`
      INSERT INTO trainer_monthly_plans (
        trainer_id, plan_name, monthly_price, sessions_per_month,
        session_duration, session_type, max_subscribers, description,
        requires_admin_approval, admin_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      trainerId,
      'Premium Fitness Package',
      200.00,
      12,
      60,
      'personal',
      3,
      'Premium monthly training package with personalized workout plans and nutrition guidance',
      true,
      null
    ]);

    console.log(`✅ Created pending plan: ${newPlan.rows[0].plan_name} (ID: ${newPlan.rows[0].id})`);
    console.log('📝 This plan is now pending admin approval and can be tested in the frontend');

  } catch (error) {
    console.error('❌ Error creating pending plan:', error);
  }
}

createPendingPlan();
