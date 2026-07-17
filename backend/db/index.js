// db/index.js — PostgreSQL connection pool
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionConfig = {
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const pool = new Pool(connectionConfig);

function createAdminPool() {
  return new Pool({
    ...connectionConfig,
    database: process.env.DB_ADMIN_NAME || 'postgres',
  });
}

async function initializeDatabase() {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    const adminPool = createAdminPool();

    try {
      const databaseName = process.env.DB_NAME;
      const exists = await adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [databaseName]
      );

      if (exists.rowCount === 0) {
        await adminPool.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
        console.log(`🛠️  Created PostgreSQL database ${databaseName}`);
      }
    } finally {
      await adminPool.end();
    }

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
  }

  const client = await pool.connect();
  try {
    // Keep local-auth columns available for older databases.
    await client.query(`
      ALTER TABLE IF EXISTS users
        ADD COLUMN IF NOT EXISTS username VARCHAR(30),
        ADD COLUMN IF NOT EXISTS password_hash TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      ALTER TABLE IF EXISTS player_stats
        ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS player_unlocks (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        unlock_id    VARCHAR(60) NOT NULL,
        unlocked_at  TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, unlock_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_player_unlocks_user_id ON player_unlocks(user_id);
    `);
  } finally {
    client.release();
  }
  console.log('✅  PostgreSQL connected');
}

const ready = initializeDatabase().catch((err) => {
  console.error('❌  PostgreSQL connection error:', err.message);
  throw err;
});

module.exports = pool;
module.exports.ready = ready;