import './utils/sentry';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import paymentRoutes from './routes/payment.route';
import { notFound } from './controllers/notFound.controller';
import { requestLogger } from './middleware/log.middleware';
import { getMetrics } from './utils/metrics';
import helmet from 'helmet';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(requestLogger);

// Routes
app.use('/payments', paymentRoutes);

// Metrics untuk melihat status aplikasi
app.get('/metrics', getMetrics);

// Route untuk menguji Sentry
app.get('/debug-sentry', (_req: Request, _res: Response) => {
  throw new Error('My first Sentry error!');
});

// Route untuk menangani halaman tidak ditemukan
app.use('*', notFound);

// Setup Sentry untuk menangani error di Express
Sentry.setupExpressErrorHandler(app);

app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // ID dari error yang ditangkap Sentry terlampir di res.sentry
  res.status(500).send((res as any).sentry + '\n');
});

export default app;
