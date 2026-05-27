import http from 'http';
import app from './app';
import prisma from './prisma/client';
import { initSocket } from './modules/notifications/socket';
import { AchievementsService } from './modules/achievements/achievements.service';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

const startServer = async () => {
  try {
    // Verify DB Connection
    await prisma.$connect();
    logger.info('Connected to the database successfully.');

    // Seed default achievements if they do not exist
    await AchievementsService.seedAchievements();
    logger.info('Database achievements seeded successfully.');

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination cleanly
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from database. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from database. Exiting...');
  process.exit(0);
});

startServer();
