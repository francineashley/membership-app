const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TEST_DB_NAME = process.env.TEST_DB_NAME || 'jasasane_app_test';
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;
const TEST_USERS = require('./test-users');

const createDatabase = async () => {
  const admin = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres',
    user: DB_USER,
    password: DB_PASSWORD,
  });
  try {
    const result = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB_NAME]);
    if (result.rows.length === 0) {
      await admin.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
      console.log(`Created test database "${TEST_DB_NAME}"`);
    } else {
      console.log(`Test database "${TEST_DB_NAME}" already exists`);
    }
  } finally {
    await admin.end();
  }
};

const seedDatabase = async () => {
  process.env.DB_NAME = TEST_DB_NAME;
  const createTables = require('../src/models/init');
  await createTables();

  const pool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: TEST_DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await pool.query('DELETE FROM otps');
    await pool.query('DELETE FROM records');
    await pool.query('DELETE FROM users');

    for (const user of TEST_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (phone, password, name, role) VALUES ($1, $2, $3, $4)',
        [user.phone, hashedPassword, user.name, user.role]
      );
      console.log(`Seeded test user ${user.phone} (${user.role})`);
    }
  } finally {
    await pool.end();
  }
};

const main = async () => {
  await createDatabase();
  await seedDatabase();
  console.log('Test database ready.');
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to prepare test database:', err);
    process.exit(1);
  });
