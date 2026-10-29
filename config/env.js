require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'glitchattire',
  DB_TEST_NAME: process.env.DB_TEST_NAME || 'glitchattire_test',
  SESSION_SECRET: process.env.SESSION_SECRET || 'glitchattire_fallback_secret_for_dev_only',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@glitchattire.test',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'change_me_now',
  CURRENCY: process.env.CURRENCY || 'PHP'
};

// Validate critical values in production
if (env.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    missing.push('SESSION_SECRET must be at least 32 characters long in production');
  }
  if (!process.env.DB_PASSWORD) {
    missing.push('DB_PASSWORD is required in production');
  }
  if (missing.length > 0) {
    throw new Error(`Production environment configuration error:\n${missing.join('\n')}`);
  }
}

module.exports = env;
