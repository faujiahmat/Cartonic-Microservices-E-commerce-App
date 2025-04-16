import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import axios from 'axios';
import { verifyAccessToken } from '../utils/jwt';
import { createOrderValidation, statusValidation } from '../validator/order.validator';
import Iitems from '../type/items.type';
import logger from '../utils/winston';
import { config } from '../configs/config';
import Sentry from '../utils/sentry';

export class OrderController {
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const { error, value } = createOrderValidation(req.body);

      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Input data gagal',
          data: null,
          error: error.details[0].message,
        });
        return;
      }

      const items = (value as unknown as { items: Iitems[] }).items;

      const productRequests = items.map((item: Iitems) =>
        axios.get(`${config.productUrl}/${item.productId}/stock`),
      );

      const stocksResponse = await Promise.all(productRequests);

      const stockData = stocksResponse.map((product: any) => product.data.data);

      // Buat map untuk lookup cepat berdasarkan product_id
      const stockMap = new Map(stockData.map((s: any) => [s.product_id, s]));

      for (const item of items) {
        const productStock = stockMap.get(item.productId);

        if (!productStock) {
          res.status(404).json({
            success: false,
            message: 'Produk tidak ditemukan',
            data: null,
            error: `Produk dengan ID ${item.productId} tidak ditemukan`,
          });
          return;
        }

        if (item.quantity > productStock.stock) {
          res.status(400).json({
            success: false,
            message: 'Stok tidak cukup',
            data: null,
            error: `Stok tidak mencukupi untuk produk ${item.productId}`,
          });
          return;
        }
      }

      const updateRequests = items.map((item: Iitems) => {
        const currentStock = stockMap.get(item.productId).stock;
        return axios.put(
          `${config.productUrl}/${item.productId}/stock`,
          {
            stock: currentStock - item.quantity,
          },
          {
            headers: { 'x-api-key': config.orderServiceApiKey },
          },
        );
      });

      await Promise.all(updateRequests);

      const newOrder = await OrderService.createOrder(userId, items);

      res.status(201).json({
        success: true,
        message: 'Berhasil membuat pesanan',
        data: newOrder,
        error: null,
      });
    } catch (error: Error | unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error dari service lain, kirimkan langsung responsenya
          res.status(error.response.status).json(error.response.data);
          return;
        }
      }

      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/order.controller.ts - createOrder : ' + (error as Error).message,
      );

      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/order.controller.ts - createOrder',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;
      const role = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).role;

      let order;

      if (role === 'admin') {
        order = await OrderService.getOrderById(orderId);
      } else {
        order = await OrderService.getOrderByIdAndUser(userId, orderId);
      }

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan',
          data: order,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Pesanan ditemukan',
        data: order,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/order.controller.ts - getOrder : ' + (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/order.controller.ts - getOrder',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const role = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).role;

      if (role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses',
          data: null,
          error: 'Forbidden',
        });
        return;
      }
      const { orderId } = req.params;
      const { error, value } = statusValidation(req.body);

      const getOrder = await OrderService.getOrderById(orderId);

      if (!getOrder) {
        res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan',
          data: getOrder,
          error: 'Not found',
        });
        return;
      }

      const status = value.status;

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: status,
          error: error.details[0].message,
        });
        return;
      }

      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);

      res.status(200).json({
        success: true,
        message: 'Update status pesanan berhasil',
        data: updatedOrder,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/order.controller.ts - updateOrderStatus : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/order.controller.ts - updateOrderStatus',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const role = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).role;

      if (role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses',
          data: null,
          error: 'Forbidden',
        });
        return;
      }

      const getOrder = await OrderService.getOrderById(orderId);

      if (!getOrder) {
        res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan',
          data: getOrder,
          error: 'Not found',
        });
        return;
      }

      const deleteOrder = await OrderService.deleteOrder(orderId);

      res.status(200).json({
        success: true,
        message: 'Pesanan berhasil dihapus',
        data: deleteOrder,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/order.controller.ts - deleteOrder : ' + (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/order.controller.ts - deleteOrder',
        data: null,
        error: (error as Error).message,
      });
    }
  }
}
