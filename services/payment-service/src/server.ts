import { closeRabbitMQ, connectRabbitMQ } from './configs/rabbitmq.config';
import { consumePaymentRequests } from './subscribers/payment.subscriber';
import { config } from './configs/config';
import logger from './utils/winston';
import app from './app';

const PORT = config.port;
let server: any;

const startServer = async () => {
  try {
    await connectRabbitMQ();
    await consumePaymentRequests();

    server = app.listen(PORT, () => {
      logger.info(`Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start service : ' + error);
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info('🛑 Shutting down Payment Service...');

  try {
    if (server) {
      server.close(() => {
        logger.info('✅ HTTP server closed');
      });
    }

    await closeRabbitMQ(); // Tutup koneksi RabbitMQ dengan aman
    logger.info('✅ RabbitMQ connection closed');

    process.exit(0);
  } catch (error) {
    logger.info('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
