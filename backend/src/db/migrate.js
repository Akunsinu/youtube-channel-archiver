require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Starting database migration...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigration();
