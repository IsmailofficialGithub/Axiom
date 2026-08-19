import app from './app.js';
import env from './config/env.config.js';

const server = app.listen(env.PORT, () => {
  console.log(`✅ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error('Unhandled Exception/Rejection:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close();
  }
});
