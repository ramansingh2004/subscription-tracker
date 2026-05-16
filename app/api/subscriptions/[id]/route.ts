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

// GET subscriptions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const subscription = await Subscription.findOne({
      _id: id,
      userId,
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: { message: 'Subscription not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { subscription } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionSchema.partial().parse(body);

    await dbConnect();

    const updateData = {
      ...validatedData,
      ...(validatedData.nextRenewalDate && {
        nextRenewalDate: new Date(validatedData.nextRenewalDate),
      }),
    };

    const { id } = await params;
    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: { message: 'Subscription not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { subscription } },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed' } },
        { status: 400 }
      );
    }

    console.error('Update subscription error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// DELETE subscriptions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const subscription = await Subscription.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: { message: 'Subscription not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { message: 'Subscription deleted' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}