/**
 * Database migration script
 * 
 * This script runs database migrations using Knex.js
 * Usage: npm run migrate
 */

require('dotenv').config();
const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Initialize knex with database configuration
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'accounting_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  migrations: {
    directory: path.join(__dirname, '../db/migrations'),
  },
});

async function runMigrations() {
  try {
    // Ensure migrations directory exists
    const migrationsDir = path.join(__dirname, '../db/migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Run migrations
    console.log('Running database migrations...');
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('Database already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      console.log('✅ Migrations completed successfully');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
