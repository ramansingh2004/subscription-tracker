import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Subscription } from '@/models/Subscription.model';
import { subscriptionSchema } from '@/lib/validation';
import { verifyAccessToken } from '@/lib/jwt';
import { ZodError } from 'zod';

function extractUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  return payload?.userId || null;
}

// GET /api/subscriptions
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const filter: any = { userId };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter).limit(limit).skip(skip).sort({ nextRenewalDate: 1 }),
      Subscription.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: subscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions
export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    await dbConnect();

    const subscription = new Subscription({
      userId,
      ...validatedData,
      nextRenewalDate: new Date(validatedData.nextRenewalDate),
    });

    await subscription.save();

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Validation failed', details: error.issues },
        },
        { status: 400 }
      );
    }

    console.error('Create subscription error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}