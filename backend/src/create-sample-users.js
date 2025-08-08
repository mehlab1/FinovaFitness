import bcrypt from 'bcryptjs';
import { query } from './database.js';

const createSampleUsers = async () => {
  try {
    console.log('👥 Creating sample users for all portal types...');

    const sampleUsers = [
      // Member
      {
        email: 'member@finovafitness.com',
        password: 'member123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'member',
        phone: '+1234567890',
        date_of_birth: '1990-05-15',
        gender: 'Male',
        address: '123 Fitness St, Gym City',
        emergency_contact: 'Jane Doe +1234567891'
      },
      // Trainer
      {
        email: 'trainer@finovafitness.com',
        password: 'trainer123',
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'trainer',
        phone: '+1234567892',
        date_of_birth: '1985-08-20',
        gender: 'Female',
        address: '456 Trainer Ave, Fitness Town',
        emergency_contact: 'Mike Johnson +1234567893'
      },
      // Nutritionist
      {
        email: 'nutritionist@finovafitness.com',
        password: 'nutritionist123',
        first_name: 'Dr. Emily',
        last_name: 'Chen',
        role: 'nutritionist',
        phone: '+1234567894',
        date_of_birth: '1988-03-10',
        gender: 'Female',
        address: '789 Health Blvd, Wellness City',
        emergency_contact: 'David Chen +1234567895'
      },
      // Admin
      {
        email: 'admin@finovafitness.com',
        password: 'admin123',
        first_name: 'Michael',
        last_name: 'Smith',
        role: 'admin',
        phone: '+1234567896',
        date_of_birth: '1980-12-25',
        gender: 'Male',
        address: '321 Admin Way, Management City',
        emergency_contact: 'Lisa Smith +1234567897'
      },
      // Front Desk
      {
        email: 'frontdesk@finovafitness.com',
        password: 'frontdesk123',
        first_name: 'Jessica',
        last_name: 'Wilson',
        role: 'front_desk',
        phone: '+1234567898',
        date_of_birth: '1992-07-08',
        gender: 'Female',
        address: '654 Reception Rd, Service Town',
        emergency_contact: 'Tom Wilson +1234567899'
      }
    ];

    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [userData.email]);
      if (existingUser.rows.length > 0) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Insert user
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, date_of_birth, gender, address, emergency_contact)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, first_name, last_name, role`,
        [userData.email, password_hash, userData.first_name, userData.last_name, userData.role, userData.phone, userData.date_of_birth, userData.gender, userData.address, userData.emergency_contact]
      );

      const user = result.rows[0];

      // If user is a trainer, create trainer profile
      if (userData.role === 'trainer') {
        await query(
          `INSERT INTO trainers (user_id, specialization, certification, experience_years, bio, hourly_rate)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, ['Strength Training', 'Cardio', 'Yoga'], ['NASM Certified', 'ACE Personal Trainer'], 5, 'Experienced personal trainer specializing in strength training and cardio workouts.', 75.00]
        );
      }

      console.log(`✅ Created ${userData.role} user: ${userData.email} (Password: ${userData.password})`);
    }

    console.log('🎉 Sample users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Member: member@finovafitness.com / member123');
    console.log('Trainer: trainer@finovafitness.com / trainer123');
    console.log('Nutritionist: nutritionist@finovafitness.com / nutritionist123');
    console.log('Admin: admin@finovafitness.com / admin123');
    console.log('Front Desk: frontdesk@finovafitness.com / frontdesk123');

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  }
};

// Run the script
createSampleUsers();
