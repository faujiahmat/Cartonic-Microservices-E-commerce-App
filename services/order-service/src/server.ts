import { startRabbitMQ, closeRabbitMQ } from './configs/rabbitmq.config';
import { consumePaymentUpdates, processExpiredOrders } from './subscribes/order.subscribe';
import logger from './utils/winston';
import { config } from './configs/config';
import app from './app';

const PORT = config.port;
let server: any;

const startServer = async () => {
  try {
    await startRabbitMQ(); // Tunggu sampai RabbitMQ siap
    await consumePaymentUpdates(); // Pastikan channel sudah ada sebelum dipakai
    await processExpiredOrders();

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

    await closeRabbitMQ(); // Tutup koneksi RabbitMQ dengan aman
    logger.info('✅ RabbitMQ connection closed');

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
