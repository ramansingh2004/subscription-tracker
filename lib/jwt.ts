import jwt from 'jsonwebtoken';
import { IUser } from '../typesDefined/index';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(user: IUser | TokenPayload): string {
  const payload = {
    userId: 'userId' in user ? user.userId : user._id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(user: IUser | TokenPayload): string {
  const payload = {
    userId: 'userId' in user ? user.userId : user._id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function generateTokens(user: IUser | TokenPayload) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}