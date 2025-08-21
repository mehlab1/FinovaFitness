import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixFunction() {
  try {
    console.log('🔧 Fixing get_available_slots_for_date function...');
    
    const sql = fs.readFileSync('fix-function.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Function fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing function:', error.message);
  } finally {
    await pool.end();
  }
}

fixFunction();
