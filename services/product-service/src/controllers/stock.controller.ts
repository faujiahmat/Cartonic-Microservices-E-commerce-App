import { Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { updateStockValidation } from '../validator/stock.validator';
import { StockService } from '../services/stock.service';
import redis from '../configs/redis.config';
import { config } from '../configs/config';
import Sentry from '../utils/sentry';
import logger from '../utils/winston';

export class StockController {
  static async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey || apiKey !== config.orderServiceApiKey) {
        const role = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).role;

        if (role !== 'admin') {
          res.status(403).json({
            success: false,
            message: 'Forbidden',
            data: null,
            error: 'Forbidden',
          });
          return;
        }
      }

      const { productId } = req.params;
      const { error, value } = updateStockValidation(req.body);

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const product = await StockService.updateStock(productId, value.stock);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not Found',
        });
        return;
      }

      await redis.del('products');
      await redis.del(`product:${productId}`);

      res.status(200).json({
        success: true,
        message: 'Stock berhasil diperbarui',
        data: { product_id: product.product_id, stock: product.stock },
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/stock.controller.ts - updateStock : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/stock.controller.ts - updateStock',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async getStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      const product = await StockService.getStock(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not Found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan stok produk',
        data: { product_id: productId, stock: product.stock },
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/stock.controller.ts - getStock : ' + (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/stock.controller.ts',
        data: null,
        error: (error as Error).message,
      });
    }
  }
}
