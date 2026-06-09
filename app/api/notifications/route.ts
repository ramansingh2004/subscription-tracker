import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models/Notification.model';
import { NotificationQueue } from '@/models/NotificationQueue.model';
import { verifyAccessToken } from '@/lib/jwt';
import { NotificationService } from '@/lib/notification-service';
import {
  getCache,
  setCache,
  deleteCache,
  cacheKeys,
  CACHE_TTL,
} from '@/lib/redis-cache-utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token) as any;
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid token' } },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // ← Check cache
    const cacheKey = cacheKeys.notifications(userId);
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(
        {
          success: true,
          data: cachedData,
          _cached: true,
        },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Get notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ userId });

    // Get pending queued notifications (for daily/weekly users)
    const pendingQueues = await NotificationQueue.findOne({
      userId,
      status: 'pending',
    }).lean();

    const data = {
      notifications,
      pendingBatch: pendingQueues
        ? {
            count: pendingQueues.notifications.length,
            scheduledFor: pendingQueues.scheduledFor,
          }
        : null,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    // ← Cache the result
    await setCache(cacheKey, data, CACHE_TTL.NOTIFICATIONS);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

// ← NEW: POST endpoint to create notification (used by other services)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token) as any;
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid token' } },
        { status: 401 }
      );
    }

    const { type, title, message, subscriptionId } = await req.json();

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Missing required fields: type, title, message' },
        },
        { status: 400 }
      );
    }

    // Create notification using service (respects frequency preference)
    const result = await NotificationService.createNotification(
      payload.userId,
      type,
      title,
      message,
      subscriptionId
    );

    // ← Invalidate cache
    await deleteCache(cacheKeys.notifications(payload.userId));
    await deleteCache(cacheKeys.notificationCount(payload.userId));

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}