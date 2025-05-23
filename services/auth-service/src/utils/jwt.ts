import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../configs/config';

const PRIVATE_KEY = config.privateKey;

export const generateToken = (payload: { user_id: string; role: string }): string => {
  const expiresIn = config.jwtExpiresIn as string;
  const options: SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'RS256',
    keyid: config.jwtIssuer,
  };

  const tokenPayload = {
    ...payload,
    iss: config.jwtIssuer,
    sub: payload.user_id,
  };
  return jwt.sign(tokenPayload, PRIVATE_KEY, options);
};

export const verifyRefreshToken = (refreshToken: string) => {
  return jwt.verify(refreshToken, PRIVATE_KEY as string) as {
    user_id: string;
    role: string;
  };
};
export const verifyAccessToken = (accessToken: string) => {
  return jwt.verify(accessToken, PRIVATE_KEY as string) as {
    user_id: string;
    role: string;
  };
};
