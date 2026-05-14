const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  connect_timeout: 10
});

async function test() {
  try {
    console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
    const result = await sql`SELECT 1 as connected`;
    console.log('Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
