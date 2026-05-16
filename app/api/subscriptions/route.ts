import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription.model';
import { subscriptionSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Validate inputs
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid page or limit parameters' },
        },
        { status: 400 }
      );
    }

    // Get user from auth (assuming middleware adds it)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Build filter
    const filter: any = { userId };
    if (category) filter.category = category;

    // Build sort
    const sort: any = { [sortBy]: sortOrder };

    let subscriptions;
    let total;
    let totalPages;

    // CURSOR-BASED PAGINATION (Preferred for performance)
    if (cursor) {
      subscriptions = await Subscription.find({
        ...filter,
        _id: { $gt: cursor },
      })
        .sort(sort)
        .limit(limit)
        .lean();

      total = await Subscription.countDocuments(filter);
      totalPages = Math.ceil(total / limit);
    } else {
      // OFFSET-BASED PAGINATION (Traditional)
      const skip = (page - 1) * limit;

      subscriptions = await Subscription.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Subscription.countDocuments(filter);
      totalPages = Math.ceil(total / limit);
    }

    // Add caching headers
    const response = NextResponse.json(
      {
        success: true,
        data: subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          cursor: subscriptions.length > 0 ? subscriptions[subscriptions.length - 1]._id : null,
        },
      },
      { status: 200 }
    );

    // Cache for 5 minutes in browser, 10 minutes in CDN
    response.headers.set(
      'Cache-Control',
      'private, max-age=300, stale-while-revalidate=600'
    );

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

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const subscription = new Subscription({
      ...validatedData,
      userId,
    });

    await subscription.save();

    // Invalidate cache (clear CDN cache for this user's subscriptions)
    const response = NextResponse.json(
      {
        success: true,
        data: subscription,
      },
      { status: 201 }
    );

    // Tell CDN to invalidate cache
    response.headers.set('Cache-Control', 'no-cache');

    return response;
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