const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./schema');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let client;
try {
  if (!connectionString || connectionString.includes('[PASSWORD]')) {
    throw new Error('Invalid or placeholder DATABASE_URL');
  }
  client = postgres(connectionString);
} catch (error) {
  console.error('CRITICAL: Failed to initialize database client:', error.message);
  console.warn('The server will start, but database operations will fail until DATABASE_URL is correctly configured.');
  // Mock client to prevent immediate crash if server continues
  client = () => { throw new Error('Database not configured'); };
}

const db = drizzle(client, { schema });

module.exports = { db, client };
