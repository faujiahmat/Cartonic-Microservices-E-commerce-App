import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { verifyAccessToken } from '../utils/jwt';
import {
  createCategoryValidation,
  updateCategoryValidation,
} from '../validator/category.validator';
import logger from '../utils/winston';
import Sentry from '../utils/sentry';

export class CategoryController {
  static async createCategory(req: Request, res: Response) {
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

      const { error, value } = createCategoryValidation(req.body);

      const existingCategory = await CategoryService.getCategoryByName(value.name);

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Kategori sudah terdaftar',
          data: value,
          error: 'Kategori sudah terdaftar',
        });
        return;
      }

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const category = await CategoryService.createCategory(value);

      res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: category,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/category.controller.ts - createCategory : ' +
          (error as Error).message,
      );
      res.status(500).json({
        succes: false,
        message: 'Error on src/controllers/category.controller.ts - createCategory',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();

      res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan semua kategori',
        data: categories,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/category.controller.ts - getCategories : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/category.controller.ts - getCategories',
        data: null,
        error: (error as Error).message,
      });
    }
  }
  static async getCategoryById(req: Request, res: Response) {
    try {
      const { category_id } = req.params;

      const categories = await CategoryService.getCategoryById(category_id);

      if (!categories) {
        res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan kategori',
        data: categories,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/category.controller.ts - getCategories : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/category.controller.ts - getCategories',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async updateCategory(req: Request, res: Response) {
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

      const category_id = req.params.category_id;
      const { error, value } = updateCategoryValidation(req.body);

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const existingCategory = await CategoryService.getCategoryByName(value.name);

      if (existingCategory && existingCategory.category_id !== category_id) {
        res.status(400).json({
          success: false,
          message: 'Kategori sudah terdaftar',
          data: value,
          error: 'Kategori sudah terdaftar',
        });
        return;
      }
      const updatedCategory = await CategoryService.updateCategory(category_id, value);

      if (!updatedCategory) {
        res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Kategori berhasil diperbarui',
        data: updatedCategory,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/category.controller.ts - updateCategory : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/category.controller.ts - updateCategory',
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
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

      const { category_id } = req.params;

      const deletedCategory = await CategoryService.deleteCategory(category_id);

      if (!deletedCategory) {
        res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus',
        data: deletedCategory,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        '❌ Error on src/controllers/category.controller.ts - deleteCategory : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/category.controller.ts - deleteCategory',
        error: (error as Error).message,
      });
    }
  }
}
