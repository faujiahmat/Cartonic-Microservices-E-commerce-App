import { Request, Response } from 'express';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Halaman tidak ditemukan',
    message: 'Halaman tidak ditemukan',
    data: null,
  });
};
