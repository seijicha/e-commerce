const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log(
    `[GlitchAttire] Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`
  );
});

process.on('SIGTERM', () => {
  console.log('[GlitchAttire] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[GlitchAttire] Process terminated.');
  });
});

module.exports = server;
