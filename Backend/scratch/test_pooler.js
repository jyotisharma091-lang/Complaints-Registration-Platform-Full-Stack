const postgres = require('postgres');

const url = "postgresql://postgres.mkxokrdkkwkcphphpyhw:rARJCdoE3CIn779F@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require";

const sql = postgres(url, {
  ssl: 'require',
  connect_timeout: 10
});

async function test() {
  try {
    console.log('Connecting to Mumbai Pooler...');
    const result = await sql`SELECT 1 as connected`;
    console.log('Success! Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection to Mumbai Pooler failed:', err.message);
    
    // Try Singapore
    try {
        console.log('Connecting to Singapore Pooler...');
        const url2 = "postgresql://postgres.mkxokrdkkwkcphphpyhw:rARJCdoE3CIn779F@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require";
        const sql2 = postgres(url2, { ssl: 'require', connect_timeout: 10 });
        const result2 = await sql2`SELECT 1 as connected`;
        console.log('Success! Result:', result2);
        process.exit(0);
    } catch (err2) {
        console.error('Connection to Singapore Pooler failed:', err2.message);
        process.exit(1);
    }
  }
}

test();
