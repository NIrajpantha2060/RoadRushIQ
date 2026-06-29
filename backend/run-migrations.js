const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function run() {
  const sqlPath = path.join(__dirname, 'migrations', 'schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    console.log('Applying migrations...');
    await pool.query(sql);
    console.log('Migrations applied successfully.');
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
