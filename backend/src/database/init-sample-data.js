import { query, getClient } from '../database.js';

const initializeSampleData = async () => {
  try {
    console.log('🚀 Starting sample data initialization...');
    
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Check if membership plans already exist
      const existingPlans = await client.query('SELECT COUNT(*) FROM membership_plans');
      
      if (existingPlans.rows[0].count === '0') {
        console.log('📋 Creating sample membership plans...');
        
        // Create sample membership plans
        const membershipPlans = [
          {
            name: 'Basic Plan',
            description: 'Perfect for beginners - access to gym facilities and group classes',
            price: 29.99,
            duration_months: 1,
            features: ['Gym access', 'Group classes', 'Basic equipment'],
            max_classes_per_month: 8,
            includes_personal_training: false,
            includes_nutrition_consultation: false
          },
          {
            name: 'Premium Plan',
            description: 'Advanced features with personal training sessions',
            price: 59.99,
            duration_months: 1,
            features: ['Gym access', 'All group classes', 'Premium equipment', 'Personal training'],
            max_classes_per_month: 20,
            includes_personal_training: true,
            includes_nutrition_consultation: false
          },
          {
            name: 'Elite Plan',
            description: 'Complete fitness experience with everything included',
            price: 99.99,
            duration_months: 1,
            features: ['Gym access', 'All classes', 'Premium equipment', 'Personal training', 'Nutrition consultation'],
            max_classes_per_month: -1, // Unlimited
            includes_personal_training: true,
            includes_nutrition_consultation: true
          }
        ];

        for (const plan of membershipPlans) {
          await client.query(
            `INSERT INTO membership_plans (name, description, price, duration_months, features, max_classes_per_month, includes_personal_training, includes_nutrition_consultation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              plan.name,
              plan.description,
              plan.price,
              plan.duration_months,
              plan.features,
              plan.max_classes_per_month,
              plan.includes_personal_training,
              plan.includes_nutrition_consultation
            ]
          );
        }
        
        console.log('✅ Sample membership plans created');
      } else {
        console.log('ℹ️  Membership plans already exist, skipping...');
      }

      // Check if muscle groups exist
      const existingMuscleGroups = await client.query('SELECT COUNT(*) FROM muscle_groups');
      
      if (existingMuscleGroups.rows[0].count === '0') {
        console.log('💪 Creating sample muscle groups...');
        
        const muscleGroups = [
          'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
          'Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Core',
          'Forearms', 'Neck', 'Traps'
        ];

        for (const muscleGroup of muscleGroups) {
          await client.query(
            'INSERT INTO muscle_groups (name, description) VALUES ($1, $2)',
            [muscleGroup, `${muscleGroup} muscle group`]
          );
        }
        
        console.log('✅ Sample muscle groups created');
      } else {
        console.log('ℹ️  Muscle groups already exist, skipping...');
      }

      // Check if exercises exist
      const existingExercises = await client.query('SELECT COUNT(*) FROM exercises');
      
      if (existingExercises.rows[0].count === '0') {
        console.log('🏋️ Creating sample exercises...');
        
        // Get muscle group IDs
        const chestId = await client.query('SELECT id FROM muscle_groups WHERE name = $1', ['Chest']);
        const backId = await client.query('SELECT id FROM muscle_groups WHERE name = $1', ['Back']);
        const shouldersId = await client.query('SELECT id FROM muscle_groups WHERE name = $1', ['Shoulders']);
        const bicepsId = await client.query('SELECT id FROM muscle_groups WHERE name = $1', ['Biceps']);
        const tricepsId = await client.query('SELECT id FROM muscle_groups WHERE name = $1', ['Triceps']);
        const legsId = await client.query('SELECT id FROM muscle_groups WHERE name = $1', ['Quadriceps']);
        
        const exercises = [
          // Chest exercises
          { name: 'Bench Press', description: 'Classic compound chest exercise', muscleGroupId: chestId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Push-ups', description: 'Bodyweight chest exercise', muscleGroupId: chestId.rows[0].id, difficulty: 'beginner' },
          { name: 'Dumbbell Flyes', description: 'Isolation chest exercise', muscleGroupId: chestId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Incline Bench Press', description: 'Upper chest focus', muscleGroupId: chestId.rows[0].id, difficulty: 'intermediate' },
          
          // Back exercises
          { name: 'Pull-ups', description: 'Upper body pulling exercise', muscleGroupId: backId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Deadlifts', description: 'Posterior chain compound exercise', muscleGroupId: backId.rows[0].id, difficulty: 'advanced' },
          { name: 'Barbell Rows', description: 'Mid-back focus exercise', muscleGroupId: backId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Lat Pulldowns', description: 'Latissimus dorsi focus', muscleGroupId: backId.rows[0].id, difficulty: 'beginner' },
          
          // Shoulder exercises
          { name: 'Military Press', description: 'Overhead pressing movement', muscleGroupId: shouldersId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Lateral Raises', description: 'Side deltoid isolation', muscleGroupId: shouldersId.rows[0].id, difficulty: 'beginner' },
          { name: 'Front Raises', description: 'Anterior deltoid focus', muscleGroupId: shouldersId.rows[0].id, difficulty: 'beginner' },
          
          // Biceps exercises
          { name: 'Barbell Curls', description: 'Classic bicep curl', muscleGroupId: bicepsId.rows[0].id, difficulty: 'beginner' },
          { name: 'Hammer Curls', description: 'Forearm and bicep focus', muscleGroupId: bicepsId.rows[0].id, difficulty: 'beginner' },
          { name: 'Preacher Curls', description: 'Strict form bicep isolation', muscleGroupId: bicepsId.rows[0].id, difficulty: 'intermediate' },
          
          // Triceps exercises
          { name: 'Dips', description: 'Compound tricep exercise', muscleGroupId: tricepsId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Skull Crushers', description: 'Lying tricep extension', muscleGroupId: tricepsId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Tricep Pushdowns', description: 'Cable tricep exercise', muscleGroupId: tricepsId.rows[0].id, difficulty: 'beginner' },
          
          // Leg exercises
          { name: 'Squats', description: 'King of leg exercises', muscleGroupId: legsId.rows[0].id, difficulty: 'intermediate' },
          { name: 'Lunges', description: 'Unilateral leg exercise', muscleGroupId: legsId.rows[0].id, difficulty: 'beginner' },
          { name: 'Leg Press', description: 'Machine leg exercise', muscleGroupId: legsId.rows[0].id, difficulty: 'beginner' },
          { name: 'Romanian Deadlifts', description: 'Posterior chain focus', muscleGroupId: legsId.rows[0].id, difficulty: 'advanced' }
        ];

        for (const exercise of exercises) {
          await client.query(
            `INSERT INTO exercises (name, description, primary_muscle_group_id, difficulty_level)
             VALUES ($1, $2, $3, $4)`,
            [exercise.name, exercise.description, exercise.muscleGroupId, exercise.difficulty]
          );
        }
        
        console.log('✅ Sample exercises created');
      } else {
        console.log('ℹ️  Exercises already exist, skipping...');
      }

      // Check if sample classes exist
      const existingClasses = await client.query('SELECT COUNT(*) FROM classes');
      
      if (existingClasses.rows[0].count === '0') {
        console.log('🏋️ Creating sample classes...');
        
        const classes = [
          {
            name: 'Cardio Blast',
            description: 'High-intensity cardio workout to burn calories',
            category: 'Cardio',
            duration_minutes: 45,
            max_capacity: 20,
            difficulty_level: 'intermediate'
          },
          {
            name: 'Strength Training',
            description: 'Build muscle and increase strength',
            category: 'Strength',
            duration_minutes: 60,
            max_capacity: 15,
            difficulty_level: 'beginner'
          },
          {
            name: 'Yoga Flow',
            description: 'Relaxing yoga session for flexibility and mindfulness',
            category: 'Flexibility',
            duration_minutes: 60,
            max_capacity: 25,
            difficulty_level: 'beginner'
          },
          {
            name: 'HIIT Circuit',
            description: 'High-intensity interval training for maximum results',
            category: 'Cardio',
            duration_minutes: 30,
            max_capacity: 18,
            difficulty_level: 'advanced'
          }
        ];

        for (const classData of classes) {
          await client.query(
            `INSERT INTO classes (name, description, category, duration_minutes, max_capacity, difficulty_level)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              classData.name,
              classData.description,
              classData.category,
              classData.duration_minutes,
              classData.max_capacity,
              classData.difficulty_level
            ]
          );
        }
        
        console.log('✅ Sample classes created');
      } else {
        console.log('ℹ️  Classes already exist, skipping...');
      }

      await client.query('COMMIT');
      console.log('🎉 Sample data initialization completed successfully!');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Sample data initialization failed:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeSampleData()
    .then(() => {
      console.log('✨ Sample data is ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export default initializeSampleData;
