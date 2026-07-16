import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import {User} from '@/models/User.model';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { setAccessTokenCookie } from '@/lib/auth-cookies';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Get refresh token from cookie or body
    let refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      try {
        const body = await req.json();
        refreshToken = body?.refreshToken;
      } catch {
        // An empty body is valid when the cookie is missing; return 401 below.
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Refresh token not found' },
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid or expired refresh token' },
        },
        { status: 401 }
      );
    }

    // Get user
    const user = await User.findById(payload.userId).select(
      '-password'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          accessToken: newAccessToken,
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      },
      { status: 200 }
    );

    setAccessTokenCookie(response, newAccessToken);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
