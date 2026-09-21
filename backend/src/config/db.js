const { Pool } = require('pg');

const isLocal =
  process.env.DB_HOST === 'localhost' ||
  process.env.DB_HOST === '127.0.0.1';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: isLocal
    ? false
    : {
        rejectUnauthorized: false
      }
});

pool.on('connect', () => {
  console.log('PostgreSQL conectado correctamente');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

module.exports = pool;