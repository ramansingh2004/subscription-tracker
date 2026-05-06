import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import {Notification} from '@/models/Notification.model';
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

    const unreadCount = await Notification.countDocuments({
      userId: payload.userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}