const postgres = require('postgres');

// Using the IP directly
const url = "postgresql://postgres.mkxokrdkkwkcphphpyhw:rARJCdoE3CIn779F@65.0.195.55:6543/postgres?sslmode=require";

const sql = postgres(url, {
  ssl: { rejectUnauthorized: false }, // Be more lenient for IP test
  connect_timeout: 10
});

async function test() {
  try {
    console.log('Connecting to Pooler via IP:', url.replace(/:[^:@]+@/, ':***@'));
    const result = await sql`SELECT 1 as connected`;
    console.log('Success! Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

test();
