import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { verifyAccessToken } from '../utils/jwt';
import { addReviewValidation } from '../validator/review.validator';
import { ProductService } from '../services/product.service';
import logger from '../utils/winston';
import Sentry from '../utils/sentry';

export class ReviewController {
  static async updateProductRating(productId: string) {
    try {
      const reviews = await ReviewService.getReviews(productId);
      const totalReviews = reviews.length;

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

      const averageRating = totalRating / totalReviews;
      const averageRatingFixed = Math.round(averageRating * 10) / 10;

      await ProductService.updateProduct(productId, {
        averageRating: averageRatingFixed,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/review.controller.ts - updateProductRating : ' +
          (error as Error).message,
      );
    }
  }

  static async addReview(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const { error, value } = addReviewValidation(req.body);

      const productExist = await ProductService.getProductById(productId);
      if (!productExist) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Input data gagal',
          data: null,
          error: error.details[0].message,
        });
        return;
      }

      const review = await ReviewService.addReview({
        productId,
        userId,
        ...value,
      });

      await ReviewController.updateProductRating(productId);

      res.status(201).json({
        success: true,
        message: 'Review berhasil ditambahkan',
        data: review,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/review.controller.ts - addReview : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/review.controller.ts',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  // Ambil semua ulasan berdasarkan produk
  static async getReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const reviews = await ReviewService.getReviews(productId);

      if (reviews.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Ulasan tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan ulasan produk',
        data: reviews,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/review.controller.ts - getReviews : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/review.controller.ts',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async updateReview(req: Request, res: Response) {
    try {
      const { productId, reviewId } = req.params;
      const { error, value } = addReviewValidation(req.body);
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Input data gagal',
          data: null,
          error: error.details[0].message,
        });
        return;
      }

      const review = await ReviewService.updateReview(
        { reviewId, userId, productId },
        {
          ...value,
        },
      );

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Ulasan tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Berhasil memperbarui ulasan',
        data: review,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/review.controller.ts - updateReview : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/review.controller.ts - updateReview',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async deleteReview(req: Request, res: Response) {
    try {
      const { reviewId, productId } = req.params;
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const review = await ReviewService.deleteReview(reviewId, userId, productId);

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Ulasan tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Berhasil menghapus ulasan',
        data: review,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/review.controller.ts - deleteReview : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/review.controller.ts - deleteReview',
        data: null,
        error: (error as Error).message,
      });
    }
  }
}
