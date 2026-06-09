import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User.model';
import { verifyAccessToken } from '@/lib/jwt';
import {
  getCache,
  setCache,
  deleteCache,
  cacheKeys,
  CACHE_TTL,
} from '@/lib/redis-cache-utils';

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

    const userId = payload.userId;

    // ← NEW: Generate cache key
    const cacheKey = cacheKeys.userProfile(userId);

    // ← NEW: Try to get from cache
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
      const response = NextResponse.json(
        {
          success: true,
          data: cachedUser,
          _cached: true,
        },
        { status: 200 }
      );

      // ← NEW: Add cache headers
      response.headers.set('Cache-Control', 'private, max-age=1800'); // 30 minutes

      return response;
    }

    await dbConnect();

    const user = await User.findById(userId).select('-passwordHash').lean(); // Use lean for faster queries

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // ← NEW: Cache the result
    await setCache(cacheKey, user, CACHE_TTL.USER_PROFILE);

    const response = NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );

    // ← NEW: Add cache headers
    response.headers.set('Cache-Control', 'private, max-age=1800'); // 30 minutes

    return response;
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

// ← NEW: PUT endpoint to update user profile
// This invalidates the cache when user updates their profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Unauthorized' },
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
          error: { message: 'Invalid token' },
        },
        { status: 401 }
      );
    }

    await dbConnect();

    const userId = payload.userId;
    const body = await request.json();

    const user = await User.findByIdAndUpdate(userId, body, {
      new: true,
      runValidators: true,
    })
      .select('-passwordHash')
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'User not found' },
        },
        { status: 404 }
      );
    }

    // ← NEW: Invalidate cache
    await deleteCache(cacheKeys.userProfile(userId));
    await deleteCache(cacheKeys.userSettings(userId));

    // ← NEW: Set fresh cache
    await setCache(cacheKeys.userProfile(userId), user, CACHE_TTL.USER_PROFILE);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Internal server error' },
      },
      { status: 500 }
    );
  }
}