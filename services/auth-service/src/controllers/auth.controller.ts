import { Request, Response } from 'express';
import axios from 'axios';
import { generateToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';
import { config } from '../configs/config';
import Sentry from '../utils/sentry';
import logger from '../utils/winston';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const response = await axios.post(`${config.userServiceUrl}/login`, {
      email,
      password,
    });

    const responseData = response.data;

    const { refreshToken, ...responseWithoutRefreshToken } = responseData.data;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth/refresh-token',
      maxAge: 28 * 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    });

    const finalResponse = {
      success: responseData.success,
      message: responseData.message,
      data: responseWithoutRefreshToken,
      error: responseData.error,
    };

    res.status(200).json(finalResponse);
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
      'Error on src/controllers/auth.controller.ts - login : ' + (error as Error).message,
    );

    res.status(500).json({
      message: 'Error validating user',
      error: (error as Error).message,
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.post(`${config.userServiceUrl}/register`, req.body);

    res.status(201).json(response.data);
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
      'Error on src/controllers/auth.controller.ts - register : ' + (error as Error).message,
    );

    res.status(500).json({
      message: 'Error registering user',
      error: (error as Error).message,
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(404).json({
        success: false,
        message: 'Refresh token tidak ditemukan',
        data: null,
        error: 'Refresh token not found',
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
        data: null,
        error: 'Unauthorized access',
      });
      return;
    }

    const response = await axios.get(`${config.userServiceUrl}/${decoded.user_id}/refresh-token`, {
      headers: { 'x-api-key': config.authServiceApiKey },
    });

    const data = response.data.data;

    if (!data || data.refreshToken !== refreshToken) {
      res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
        data: null,
        error: 'Unauthorized access',
      });
      return;
    }

    const newAccessToken = generateToken({
      user_id: data.user_id,
      role: data.role,
    });

    res.status(200).json({
      success: true,
      message: 'Access token diperbarui',
      data: { token: newAccessToken },
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
      'Error on src/controllers/auth.controller.ts - login : ' + (error as Error).message,
    );

    res.status(500).json({
      success: false,
      message: 'Error on file src/controllers/user.controller.ts : getRefreshToken',
      data: null,
      error: (error as Error).message,
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized, token missing',
        data: null,
        error: 'Token missing',
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    const response = await axios.get(`${config.userServiceUrl}/${decoded.user_id}/logout`, {
      headers: {
        'x-api-key': config.authServiceApiKey,
      },
    });

    const data = response.data;

    res.clearCookie('refreshToken', { path: '/auth/refresh-token' });

    res.status(200).json(data);
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
      'Error on src/controllers/auth.controller.ts - logout : ' + (error as Error).message,
    );

    res.status(500).json({
      success: false,
      message: 'Error on file src/controllers/user.controller.ts : getRefreshToken',
      data: null,
      error: (error as Error).message,
    });
  }
};
