import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User.model';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid token', code: 'INVALID_TOKEN' },
        },
        { status: 401 }
      );
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Internal server error', code: 'SERVER_ERROR' },
      },
      { status: 500 }
    );
  }
}