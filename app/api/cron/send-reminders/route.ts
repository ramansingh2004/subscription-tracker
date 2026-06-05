import { NextRequest, NextResponse } from 'next/server';
import { checkAndProcessSubRenewals } from '@/lib/subscription-helper';

// ============ SEND REMINDERS (Called by cron job) ============

export async function POST(request: NextRequest) {
  try {
    // Verify the request has correct authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const processedCount = await checkAndProcessSubRenewals();

    console.log(`✅ Cron job completed: processed ${processedCount} subscription events`);

    return NextResponse.json(
      {
        success: true,
        data: {
          processedCount,
          message: `Processed ${processedCount} subscription events successfully`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to send reminders' },
      },
      { status: 500 }
    );
  }
}