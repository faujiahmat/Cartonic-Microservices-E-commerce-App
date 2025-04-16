import './utils/sentry';
import express, { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import product from './routes/product.route';
import category from './routes/category.route';
import connectDB from './db/db';
import { errorHandling, notFound } from './controllers/error.controller';
import { requestLogger } from './middleware/log.middleware';
import { getMetrics } from './utils/metrics';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: '*',
  }),
);
app.use(cookieParser());

connectDB();

// routes
app.use('/products', product);
app.use('/products/categories', category);

// metrics untuk melihat status aplikasi
app.get('/metrics', getMetrics);

// Route untuk menguji Sentry
app.get('/debug-sentry', (_req: Request, _res: Response) => {
  throw new Error('My first Sentry error!');
});

app.use('*', notFound);
app.use('*', errorHandling);

// Setup Sentry untuk menangani error di Express
Sentry.setupExpressErrorHandler(app);

app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // ID dari error yang ditangkap Sentry terlampir di res.sentry
  res.status(500).send((res as any).sentry + '\n');
});

export default app;
