const mysql = require('mysql2/promise');
const env = require('./env');

const dbName = env.NODE_ENV === 'test' ? env.DB_TEST_NAME : env.DB_NAME;

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: 'Z'
});

module.exports = pool;
