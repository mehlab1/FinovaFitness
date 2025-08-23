import { query } from './src/database.js';
import fs from 'fs';
import path from 'path';

async function runCompleteTrainerSubscriptionFix() {
  try {
    console.log('🚀 Starting complete trainer subscription system fix...\n');
    
    // 1. Add trainer approval columns
    console.log('1️⃣ Adding trainer approval columns...');
    const approvalMigrationPath = path.join(process.cwd(), 'src', 'database', 'add-trainer-approval-columns.sql');
    const approvalSQL = fs.readFileSync(approvalMigrationPath, 'utf8');
    await query(approvalSQL);
    console.log('   ✅ Added: trainer_approval_date, trainer_approval_notes\n');
    
    // 2. Add trainer rejection columns
    console.log('2️⃣ Adding trainer rejection columns...');
    const rejectionMigrationPath = path.join(process.cwd(), 'src', 'database', 'add-trainer-rejection-columns.sql');
    const rejectionSQL = fs.readFileSync(rejectionMigrationPath, 'utf8');
    await query(rejectionSQL);
    console.log('   ✅ Added: trainer_rejection_date, trainer_rejection_reason\n');
    
    // 3. Update status constraint to include 'rejected'
    console.log('3️⃣ Updating status constraint...');
    const statusMigrationPath = path.join(process.cwd(), 'src', 'database', 'add-rejected-status.sql');
    const statusSQL = fs.readFileSync(statusMigrationPath, 'utf8');
    await query(statusSQL);
    console.log('   ✅ Updated status constraint to include: active, cancelled, expired, pending, paused, rejected\n');
    
    console.log('🎉 Complete trainer subscription system fix completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   • Added trainer_approval_date (TIMESTAMP)');
    console.log('   • Added trainer_approval_notes (TEXT)');
    console.log('   • Added trainer_rejection_date (TIMESTAMP)');
    console.log('   • Added trainer_rejection_reason (TEXT)');
    console.log('   • Updated status constraint to include "rejected"');
    console.log('   • Added performance indexes for new columns');
    console.log('\n✨ The trainer subscription approval/rejection system should now work correctly!');
    
  } catch (error) {
    console.error('❌ Error running complete trainer subscription fix:', error);
    process.exit(1);
  }
}

// Run the complete fix
runCompleteTrainerSubscriptionFix();
