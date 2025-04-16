import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { createProductValidation, updateProductValidation } from '../validator/product.validator';
import { verifyAccessToken } from '../utils/jwt';
import redis from '../configs/redis.config';
import { CategoryService } from '../services/category.service';
import { Types } from 'mongoose';
import Sentry from '../utils/sentry';
import logger from '../utils/winston';
import { config } from '../configs/config';

export class ProductController {
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
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

      const { error, value } = createProductValidation(req.body);

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const product = await ProductService.createProduct(value);

      const redisDel = await redis.del('products');

      if (redisDel) {
        logger.info('✅ Redis cache cleared');
      }

      res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan',
        data: product,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - createProduct : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message:
          'Error on src/controllers/product.controller.ts - createProduct : ' +
          (error as Error).message,
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        category,
        minPrice,
        maxPrice,
        minRating,
        sort,
        page = 1,
        limit = 10,
      } = req.query;

      // 🏷️ Membuat cache key berdasarkan query params
      const cacheKey = `products:${search || ''}:${category || ''}:${
        minPrice || ''
      }:${maxPrice || ''}:${minRating || ''}:${sort || ''}:${page}:${limit}`;

      // 🔍 Cek cache di Redis
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.info('✅ Data dari cache Redis');
        res.status(200).json({
          success: true,
          message: 'Berhasil mendapatkan semua produk',
          data: JSON.parse(cachedData),
          error: null,
        });
        return;
      }

      // 🏷️ Buat filter query
      const filter: any = {};

      // 🔍 Filter berdasarkan search (nama atau deskripsi)
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // 🔍 Filter berdasarkan kategori
      if (category) {
        filter.category = category;
      }

      // 🔍 Filter berdasarkan rentang harga
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      // 🔍 Filter berdasarkan rating minimal
      if (minRating) {
        filter.averageRating = { $gte: Number(minRating) };
      }

      // 🔀 Sorting berdasarkan request
      const sortOptions: any = {};
      if (sort === 'price_asc') sortOptions.price = 1;
      if (sort === 'price_desc') sortOptions.price = -1;
      if (sort === 'rating_asc') sortOptions.averageRating = 1;
      if (sort === 'rating_desc') sortOptions.averageRating = -1;
      if (sort === 'newest') sortOptions.createdAt = -1;

      // 📄 Pagination setup
      const skip = (Number(page) - 1) * Number(limit);

      // 🔥 Fetch Data dari Database
      const products = await ProductService.filterProducts(
        filter,
        sortOptions,
        skip,
        Number(limit),
      );

      // 🔢 Total count untuk pagination
      const totalProducts = await ProductService.countDocuments(filter);

      const responseData = {
        products,
        pagination: {
          total: totalProducts,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalProducts / Number(limit)),
        },
      };

      // 🏷️ Simpan hasil ke Redis dengan TTL
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', Number(config.redisTTL));

      res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan semua produk',
        data: responseData,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - getAllProducts : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message:
          'Error on src/controllers/product.controller.ts - getAllProducts : ' +
          (error as Error).message,
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.productId;
      const product = await ProductService.getProductById(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan produk',
        data: product,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - getProductById : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message:
          'Error on src/controllers/product.controller.ts - getProductById : ' +
          (error as Error).message,
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
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

      const productId = req.params.productId;
      const { error, value } = updateProductValidation(req.body);

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const product = await ProductService.updateProduct(productId, value);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      await redis.del('products');
      await redis.del(`product:${productId}`);

      res.status(200).json({
        success: true,
        message: 'Produk berhasil diperbarui',
        data: product,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - updateProduct : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message:
          'Error on src/controllers/product.controller.ts - updateProduct : ' +
          (error as Error).message,
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
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

      const productId = req.params.productId;

      const product = await ProductService.deleteProduct(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      await redis.del('products');
      await redis.del(`product:${productId}`);

      res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus',
        data: product,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - deleteProduct : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message:
          'Error on src/controllers/product.controller.ts - deleteProduct : ' +
          (error as Error).message,
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async addCategoryToProduct(req: Request, res: Response): Promise<void> {
    try {
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

      const { productId } = req.params;
      const { category_id } = req.body;

      const product = await ProductService.getProductById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }
      const category = await CategoryService.getCategoryById(category_id);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      const isCategoryExist = product.category?.some((id) =>
        id.equals(category._id as Types.ObjectId),
      );
      if (isCategoryExist) {
        res.status(400).json({
          success: false,
          message: 'Kategori sudah ada di produk ini',
          data: null,
          error: 'Bad request',
        });
        return;
      }

      product.category?.push(category._id as Types.ObjectId);
      await product.save();
      const productReturn = await ProductService.getProductById(productId);

      res.status(200).json({
        success: true,
        message: 'Kategori berhasil ditambahkan ke produk',
        data: productReturn,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - addCategoryToProduct : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/product.controller.ts - addCategoryToProduct',
        error: (error as Error).message,
      });
    }
  }

  static async removeCategoryFromProduct(req: Request, res: Response): Promise<void> {
    try {
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

      const { productId, categoryId } = req.params;

      const product = await ProductService.getProductById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      const category = await CategoryService.getCategoryById(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      const categoryIndex = product.category?.findIndex(
        (obj) => JSON.stringify(obj) === JSON.stringify(category as unknown as Types.ObjectId),
      );

      if (categoryIndex === -1) {
        res.status(400).json({
          success: false,
          message: 'Kategori tidak ditemukan di produk ini',
          data: null,
          error: 'Bad request',
        });
        return;
      }

      product.category?.splice(categoryIndex as number, 1);
      await product.save();

      res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus dari produk',
        data: product,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/product.controller.ts - removeCategoryFromProduct : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/product.controller.ts - removeCategoryFromProduct',
        error: (error as Error).message,
      });
    }
  }
}
