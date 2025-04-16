import { Request, Response } from 'express';
import logger from '../utils/winston';

export const errorHandling = (err: Error, _req: Request, res: Response): void => {
  const message = err.message.includes(' - ') ? err.message.split(' - ')[1] : err.message;
  logger.error(message);
  res.status(500).json({
    error: message,
    message: 'Internal Server Error',
    data: null,
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Halaman tidak ditemukan',
    message: 'Halaman tidak ditemukan',
    data: null,
  });
};
