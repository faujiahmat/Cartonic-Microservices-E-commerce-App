import { Request, Response, NextFunction } from 'express';
import logger from '../utils/winston';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  // log yang sedang berjalan
  logger.info(`${req.method} ${req.url}`);

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(3);
    logger.info(
      `${req.method} ${req.url} ${res.statusCode} ${durationMs} ms - ${res.get('Content-Length') || 0}`,
    );
  });

  next();
}
