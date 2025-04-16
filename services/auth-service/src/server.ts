import app from './app';
import { config } from './configs/config';
import logger from './utils/winston';

const PORT = config.port;

let server: any;

const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      logger.info(`🚀 Order Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start service:', error);
    process.exit(1); // Keluar dengan kode error
  }
};

// **Shutdown Handling**
const shutdown = async () => {
  logger.info('🛑 Shutting down Order Service...');

  try {
    if (server) {
      server.close(() => {
        logger.info('✅ HTTP server closed');
      });
    }

    process.exit(0); // Keluar dengan sukses
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Tangkap sinyal untuk graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
