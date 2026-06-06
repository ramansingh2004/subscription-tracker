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

    const categoryGroups: Record<string, { category: string; count: number; cost: number; monthlyEquivalent: number }> = {};
    let totalMonthlyEquivalent = 0;

    for (const sub of subscriptions) {
      const cat = sub.category || 'Other';
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = {
          category: cat,
          count: 0,
          cost: 0,
          monthlyEquivalent: 0,
        };
      }

      categoryGroups[cat].count += 1;
      categoryGroups[cat].cost += sub.cost;

      let subMonthly = 0;
      if (sub.billingCycle === 'monthly') {
        subMonthly = sub.cost;
      } else if (sub.billingCycle === 'yearly') {
        subMonthly = sub.cost / 12;
      } else if (sub.billingCycle === 'quarterly') {
        subMonthly = sub.cost / 3;
      }
      categoryGroups[cat].monthlyEquivalent += subMonthly;
      totalMonthlyEquivalent += subMonthly;
    }

    const categoriesList = Object.values(categoryGroups).map((group) => {
      const percentage = totalMonthlyEquivalent > 0
        ? Math.round((group.monthlyEquivalent / totalMonthlyEquivalent) * 1000) / 10
        : 0;

      return {
        category: group.category,
        count: group.count,
        cost: Math.round(group.cost * 100) / 100,
        totalCost: Math.round(group.cost * 100) / 100,
        monthlyEquivalent: Math.round(group.monthlyEquivalent * 100) / 100,
        percentage,
      };
    }).sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesList,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}