import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import {User} from '@/models/User.model';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Get refresh token from cookie or body
    const refreshToken =
      req.cookies.get('refreshToken')?.value ||
      (await req.json()).refreshToken;

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
    const payload = verifyRefreshToken(refreshToken) as any;
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

    // Set new access token cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}