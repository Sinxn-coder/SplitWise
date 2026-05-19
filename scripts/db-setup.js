const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Safe URL-encoded password to handle special symbols ($, &, %) properly
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ksdegmsuhzqqdlnzsqmu:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase SSL connections
    }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL instance...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Reading database schema setup.sql...');
    const sqlPath = path.join(__dirname, '../sql/setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing database schema queries...');
    await client.query(sql);
    console.log('─────────────────────────────────────────────────────────────────');
    console.log('✅ Success! All database tables and unique schemas created!');
    console.log('─────────────────────────────────────────────────────────────────');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
