import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../configs/config';

const privateKey = config.privateKey;

export const generateRefreshToken = (payload: { user_id: string; role: string }): string => {
  const expiresIn = config.jwtRefreshExpiresIn as string;
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
  return jwt.sign(tokenPayload, privateKey, options);
};

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
  return jwt.sign(tokenPayload, privateKey, options);
};

export const verifyAccessToken = (accessToken: string) => {
  return jwt.verify(accessToken, privateKey) as {
    user_id: string;
    role: string;
  };
};
