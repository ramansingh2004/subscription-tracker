import { NextResponse } from 'next/server';

const cookieDefaults = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAccessTokenCookie(
  response: NextResponse,
  accessToken: string
) {
  response.cookies.set('accessToken', accessToken, {
    ...cookieDefaults,
    maxAge: 15 * 60,
  });
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  setAccessTokenCookie(response, accessToken);
  response.cookies.set('refreshToken', refreshToken, {
    ...cookieDefaults,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('accessToken', '', {
    ...cookieDefaults,
    maxAge: 0,
  });
  response.cookies.set('refreshToken', '', {
    ...cookieDefaults,
    maxAge: 0,
  });
}
