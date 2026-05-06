import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import {Subscription} from '@/models/Subscription.model';
import { verifyAccessToken } from '@/lib/jwt';

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

    const days = parseInt(new URL(req.url).searchParams.get('days') || '30');
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const subscriptions = await Subscription.find({
      userId: payload.userId,
      status: 'active',
      nextRenewalDate: {
        $gte: today,
        $lte: futureDate,
      },
    }).sort({ nextRenewalDate: 1 });

    const totalCost = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        summary: {
          count: subscriptions.length,
          totalCost,
          daysRange: days,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}