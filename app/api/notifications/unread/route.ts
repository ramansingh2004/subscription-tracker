import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models/Notification.model';
import { NotificationQueue } from '@/models/NotificationQueue.model';
import { verifyAccessToken } from '@/lib/jwt';
import {
  getCache,
  setCache,
  clearNotificationCache,
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
    const cacheKey = cacheKeys.notificationCount(userId);
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

    // Count unread in-app notifications
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    // Count pending queued notifications (not yet delivered)
    const pendingQueue = await NotificationQueue.findOne({
      userId,
      status: 'pending',
    }).lean();

    const pendingCount = pendingQueue ? pendingQueue.notifications.length : 0;

    // Total unread (including pending batches)
    const totalUnread = unreadCount + pendingCount;

    const data = {
      unreadCount,
      pendingCount, // For daily/weekly users
      totalUnread,
    };

    // ← Cache for 5 minutes
    await setCache(cacheKey, data, CACHE_TTL.NOTIFICATION_COUNT);

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

// ← NEW: Mark notification as read
export async function PUT(req: NextRequest) {
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

    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: { message: 'notificationId is required' } },
        { status: 400 }
      );
    }

    // Mark as read
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: payload.userId },
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, error: { message: 'Notification not found' } },
        { status: 404 }
      );
    }

    // ← Invalidate caches
    await clearNotificationCache(payload.userId);

    return NextResponse.json(
      {
        success: true,
        data: notification,
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
