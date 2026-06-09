import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription.model';
import { subscriptionSchema } from '@/lib/validation';
import { verifyAccessToken } from '@/lib/jwt';
import { ZodError } from 'zod';
import { checkAndProcessSubRenewals } from '@/lib/subscription-helper';
import {
  getCache,
  setCache,
  clearSubscriptionCache,
  cacheKeys,
  CACHE_TTL,
} from '@/lib/redis-cache-utils';

function extractUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  return payload?.userId || null;
}

// GET ALL SUBSCRIPTIONS WITH PAGINATION + REDIS CACHING

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user ID from Bearer token
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Unauthorized' },
        },
        { status: 401 }
      );
    }

    // Dynamically check and process renewals/notifications for the user
    await checkAndProcessSubRenewals(userId);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10'))
    );
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const search = searchParams.get('search');

    // ← NEW: Generate cache key
    const cacheKey = cacheKeys.subscriptionsList(userId, page, limit);

    // ← NEW: Try to get from cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      const cached = cachedData as any;
      return NextResponse.json(
        {
          success: true,
          data: cached.subscriptions,
          pagination: cached.pagination,
          _cached: true,
        },
        { status: 200 }
      );
    }

    // Build filter
    const filter: any = { userId };

    if (category && category !== 'All') {
      filter.category = category;
    }

    // Add text search if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = { [sortBy]: sortOrder };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch total count for pagination info
    const total = await Subscription.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch subscriptions with pagination
    const subscriptions = await Subscription.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for faster queries

    const paginationData = {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    };

    // ← NEW: Cache the result
    await setCache(
      cacheKey,
      { subscriptions, pagination: paginationData },
      CACHE_TTL.SUBSCRIPTIONS_LIST
    );

    const response = NextResponse.json(
      {
        success: true,
        data: subscriptions,
        pagination: paginationData,
      },
      { status: 200 }
    );

    // ← NEW: Add cache headers
    response.headers.set('Cache-Control', 'private, max-age=600'); // 10 minutes

    return response;
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch subscriptions' },
      },
      { status: 500 }
    );
  }
}

// CREATE NEW SUBSCRIPTION + INVALIDATE CACHE

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Unauthorized' },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    const subscription = new Subscription({
      ...validatedData,
      userId,
    });

    await subscription.save();

    // ← NEW: Invalidate related caches
    await clearSubscriptionCache(userId);

    return NextResponse.json(
      {
        success: true,
        data: subscription,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error('Create subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to create subscription' },
      },
      { status: 500 }
    );
  }
}