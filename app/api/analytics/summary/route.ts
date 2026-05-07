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

    const subscriptions = await Subscription.find({
      userId: payload.userId,
      status: 'active',
    });

    // Calculate monthly cost
    const monthlyCost = subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === 'monthly') return sum + sub.cost;
      if (sub.billingCycle === 'yearly') return sum + sub.cost / 12;
      if (sub.billingCycle === 'quarterly') return sum + sub.cost / 3;
      return sum;
    }, 0);

    const yearlyCost = subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === 'yearly') return sum + sub.cost;
      if (sub.billingCycle === 'monthly') return sum + sub.cost * 12;
      if (sub.billingCycle === 'quarterly') return sum + sub.cost * 4;
      return sum;
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSubscriptions: subscriptions.length,
          monthlyCost: Math.round(monthlyCost * 100) / 100,
          yearlyCost: Math.round(yearlyCost * 100) / 100,
          averagePerSubscription: Math.round((monthlyCost / subscriptions.length) * 100) / 100,
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