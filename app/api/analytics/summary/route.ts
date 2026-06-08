import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import {Subscription} from '@/models/Subscription.model';
import { verifyAccessToken } from '@/lib/jwt';

// Exchange rates (base: USD) — must match lib/currency-service.ts
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
};

/** Convert an amount from any supported currency to USD */
function toUSD(amount: number, fromCurrency: string): number {
  const rate = EXCHANGE_RATES[fromCurrency] || 1;
  return amount / rate;
}

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

    // Calculate monthly cost — normalize every subscription to USD first
    const monthlyCost = subscriptions.reduce((sum, sub) => {
      const costInUSD = toUSD(sub.cost, sub.currency || 'USD');
      if (sub.billingCycle === 'monthly') return sum + costInUSD;
      if (sub.billingCycle === 'yearly') return sum + costInUSD / 12;
      if (sub.billingCycle === 'quarterly') return sum + costInUSD / 3;
      return sum;
    }, 0);

    const yearlyCost = subscriptions.reduce((sum, sub) => {
      const costInUSD = toUSD(sub.cost, sub.currency || 'USD');
      if (sub.billingCycle === 'yearly') return sum + costInUSD;
      if (sub.billingCycle === 'monthly') return sum + costInUSD * 12;
      if (sub.billingCycle === 'quarterly') return sum + costInUSD * 4;
      return sum;
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSubscriptions: subscriptions.length,
          monthlyCost: Math.round(monthlyCost * 100) / 100,
          yearlyCost: Math.round(yearlyCost * 100) / 100,
          averagePerSubscription: subscriptions.length
            ? Math.round((monthlyCost / subscriptions.length) * 100) / 100
            : 0,
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