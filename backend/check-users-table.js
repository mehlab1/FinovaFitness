import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/finovafitness'
});

async function checkUsersTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table structure:');
    result.rows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type}) - nullable: ${row.is_nullable}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
