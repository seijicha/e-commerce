const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function resetDatabase() {
  const dbName = process.argv.includes('--test') ? env.DB_TEST_NAME : env.DB_NAME;
  console.log(`[db:reset] Connecting to MySQL server at ${env.DB_HOST}:${env.DB_PORT}...`);

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log(`[db:reset] Recreating database '${dbName}'...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    await connection.query(
      `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${dbName}\`;`);

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // Replace hardcoded DB name if running against test database
    schemaSql = schemaSql.replace(/glitchattire/g, dbName);

    console.log('[db:reset] Applying database schema...');
    await connection.query(schemaSql);

    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('[db:reset] Populating seed data...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
    }

    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
      console.log(`[db:reset] Seeding default administrator account '${env.ADMIN_EMAIL}'...`);
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      await connection.execute(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES (?, ?, ?, 'admin', 1)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', is_active = 1`,
        ['Glitch Administrator', env.ADMIN_EMAIL.toLowerCase().trim(), passwordHash]
      );
    }

    console.log(`[db:reset] Database '${dbName}' reset and seeded successfully!`);
  } catch (err) {
    console.error('[db:reset] Failed to reset database:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetDatabase();
