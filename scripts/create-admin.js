const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function seedAdmin() {
  const dbName = process.argv.includes('--test') ? env.DB_TEST_NAME : env.DB_NAME;
  console.log(`[seed:admin] Connecting to database '${dbName}'...`);

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: dbName
  });

  try {
    const email = env.ADMIN_EMAIL;
    const password = env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment');
    }

    console.log(`[seed:admin] Generating bcrypt password hash for '${email}'...`);
    const passwordHash = await bcrypt.hash(password, 12);

    const [existing] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await connection.execute(
        'UPDATE users SET password_hash = ?, role = "admin", is_active = 1, updated_at = NOW() WHERE email = ?',
        [passwordHash, email]
      );
      console.log(`[seed:admin] Existing user '${email}' successfully promoted/updated to admin.`);
    } else {
      await connection.execute(
        'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, "admin", 1)',
        ['Glitch Administrator', email, passwordHash]
      );
      console.log(`[seed:admin] Admin account '${email}' created successfully.`);
    }
  } catch (err) {
    console.error('[seed:admin] Failed to seed admin:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedAdmin();
