import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { NotificationService } from '@/lib/notification-service';

/**
 * Cron endpoint to process queued notifications
 * 
 * Schedule this in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-notifications",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 * 
 * This runs daily at 9 AM UTC
 * 
 * For local testing:
 * curl -X POST http://localhost:3000/api/cron/process-notifications \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    console.log('🔄 Starting notification queue processing...');

    // Process all pending queued notifications
    const result = await NotificationService.processQueuedNotifications();

    return NextResponse.json(
      {
        success: true,
        message: 'Notification queues processed',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error processing notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to process notifications',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// For GET requests (browser testing)
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const result = await NotificationService.processQueuedNotifications();

    return NextResponse.json(
      {
        success: true,
        message: 'Notification queues processed',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}