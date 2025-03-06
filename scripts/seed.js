/**
 * Database seed script
 * 
 * This script populates the database with initial seed data
 * Usage: npm run seed
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
  seeds: {
    directory: path.join(__dirname, '../db/seeds'),
  },
});

async function runSeeds() {
  try {
    // Ensure seeds directory exists
    const seedsDir = path.join(__dirname, '../db/seeds');
    if (!fs.existsSync(seedsDir)) {
      fs.mkdirSync(seedsDir, { recursive: true });
    }

    // Run seeds
    console.log('Running database seeds...');
    await db.seed.run();
    console.log('✅ Seed data inserted successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runSeeds();
