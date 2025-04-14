require('dotenv').config();
const { Client } = require('pg');

async function pruneDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || ''
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');

    // Get all tables in the public schema
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `);

    const tables = tablesResult.rows.map(row => row.tablename);
    console.log('Found tables:', tables);

    // Drop each table
    for (const table of tables) {
      console.log(`Dropping table: ${table}`);
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    }

    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');

    console.log('All tables have been dropped successfully');
  } catch (error) {
    console.error('Error pruning database:', error);
  } finally {
    await client.end();
  }
}

pruneDatabase().catch(console.error);
