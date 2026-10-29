const session = require('express-session');
const env = require('./env');

let sessionStore = null;

// In development and production, use MySQL session store.
// In test environment (or fallback), use express-session built-in MemoryStore for speed and reliability.
if (env.NODE_ENV !== 'test') {
  const MySQLStore = require('express-mysql-session')(session);
  sessionStore = new MySQLStore({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000, // 24 hours
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  });

  sessionStore.on('error', err => {
    console.error('[Session Store Error]:', err.message);
  });
}

const sessionMiddleware = session({
  name: 'glitchattire.sid',
  secret: env.SESSION_SECRET,
  ...(sessionStore ? { store: sessionStore } : {}),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
});

module.exports = {
  sessionStore,
  sessionMiddleware
};
