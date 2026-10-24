const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      console.log(`🚀 SkillSwap Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
      console.log(`🩺 Health check available at http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

if (require.main === module) {
  startServer();
}

module.exports = { server, startServer };
