/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import {
  inputUserValidation,
  loginUserValidation,
  updateUserValidation,
} from '../validator/user.validator';
import { encrypt, compare } from '../utils/bcrypt';
import { generateRefreshToken, generateToken, verifyAccessToken } from '../utils/jwt';
import Sentry from '../utils/sentry';
import logger from '../utils/winston';
import { config } from '../configs/config';

export class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = inputUserValidation(req.body);

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const existingUser = await UserService.getUserByEmail(value);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar',
          data: value,
          error: 'Email sudah terdaftar',
        });
        return;
      }

      value.password = encrypt(value.password);
      delete value.confirmPassword;

      const user = await UserService.registerUser(value);
      res.status(201).json({
        success: true,
        message: 'register berhasil',
        data: user,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : UserController.register - ' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message:
          'Error on file src/controllers/user.controller.ts : UserController.register - ' +
          String((error as Error).message),
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginUserValidation(req.body);

      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const user = await UserService.loginUser(value);

      if (user === null) {
        res.status(404).json({
          success: false,
          message: 'Email atau password salah',
          data: null,
          error: 'User tidak ditemukan',
        });
        return;
      }

      if (!compare(value.password, user.password)) {
        res.status(400).json({
          success: false,
          message: 'Email atau password salah',
          data: null,
          error: 'Password salah',
        });
        return;
      }

      const refreshTokenFromDB: string = generateRefreshToken({
        user_id: user.user_id,
        role: user.role,
      });

      user.refreshToken = refreshTokenFromDB;

      await user.save();

      const userObject = user.toJSON();

      const token = generateToken({
        user_id: user.user_id,
        role: user.role,
      });

      if (!token) {
        res.status(404).json({
          success: false,
          message: 'Token tidak ditemukan',
          data: null,
          error: 'Token not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: { ...userObject, token },
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : UserController.login - ' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message:
          'Error on file src/controllers/user.controller.ts : UserController.login - ' +
          String((error as Error).message),
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const user_id = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const user = await UserService.getUserById(user_id);

      if (!user || !user.refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Session expired, please login again',
          data: null,
          error: 'Session expired',
        });
        return;
      }
      const userObject = user?.toJSON();

      const { refreshToken, ...userWithoutRefreshToken } = userObject;

      res.status(200).json({
        success: true,
        message: 'Data pengguna berhasil didapatkan',
        data: userWithoutRefreshToken,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : UserController.getUserProfile - ' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message:
          'Error on file src/controllers/user.controller.ts : UserController.getUserProfile - ' +
          String((error as Error).message),
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const user_id = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const { error, value } = updateUserValidation(req.body);
      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Update data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }
      const existingUser = await UserService.getUserByEmail(value);

      if (value.email === existingUser?.email && existingUser?.user_id !== user_id) {
        res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar',
          data: value,
          error: 'Email sudah terdaftar',
        });
        return;
      }

      value.password = encrypt(value.password);

      const user = await UserService.updateUser(user_id, value);

      if (!user || !user.refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Session expired, please login again',
          data: null,
          error: 'Session expired',
        });
        return;
      }

      const { refreshToken, ...userWithoutRefreshToken } = user.toJSON();

      res.status(200).json({
        success: true,
        message: 'Data pengguna berhasil diupdate',
        data: userWithoutRefreshToken,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : UserController.updateUser - ' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message:
          'Error on file src/controllers/user.controller.ts : UserController.updateUser - ' +
          String((error as Error).message),
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async deleteUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const user_id = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const user = await UserService.deleteUser(user_id);

      if (!user || !user.refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Session expired, please login again',
          data: null,
          error: 'Session expired',
        });
        return;
      }

      const { refreshToken, ...userWithoutRefreshToken } = user.toJSON();

      res.status(200).json({
        success: true,
        message: 'User berhasil dihapus',
        data: userWithoutRefreshToken,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : UserController.deleteUser - ' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message:
          'Error on file src/controllers/user.controller.ts : UserController.deleteUser - ' +
          String((error as Error).message),
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey || apiKey !== config.authServiceApiKey) {
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

      const user_id = req.params.id as string;

      const user = await UserService.getUserById(user_id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
          data: null,
          error: 'Not Found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Access token diperbarui',
        data: user,
        error: null,
      });
    } catch (error) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : refreshAccessToken - ' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message:
          'Error on file src/controllers/user.controller.ts : refreshAccessToken - ' +
          String((error as Error).message),
        data: null,
        error: (error as Error).message,
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const user_id = req.params.id as string;

      const user = await UserService.getUserById(user_id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
          data: null,
          error: 'Not Found',
        });
        return;
      }

      if (!user.refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Session expired, please login again',
          data: null,
          error: 'Session expired',
        });
        return;
      }

      user.refreshToken = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Logout berhasil',
        data: user,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on file src/controllers/user.controller.ts : UserController.logout' +
          String((error as Error).message),
      );
      res.status(500).json({
        success: false,
        message: 'Error on file src/controllers/user.controller.ts : logout',
        error: (error as Error).message,
      });
    }
  }
}
