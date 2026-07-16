import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ExtensionTracking } from '@/models/ExtensionTracking.model';
import { verifyAccessToken } from '@/lib/jwt';
import { deleteCache, deletePatternCache } from '@/lib/redis-cache-utils';
import mongoose from 'mongoose';

const TRACKING_EVENT_TYPES = new Set([
  'page_visit',
  'time_on_page',
  'ad_detected',
  'paywall_detected',
  'subscription_mention',
]);

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
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
    const body = await request.json();
    const { events, timestamp } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid events data' } },
        { status: 400 }
      );
    }

    // Validate and process events
    const invalidEvent = events.find(
      (event) =>
        !event ||
        !TRACKING_EVENT_TYPES.has(event.type) ||
        typeof event.domain !== 'string' ||
        typeof event.url !== 'string'
    );

    if (invalidEvent) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid tracking event' } },
        { status: 400 }
      );
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const processedEvents = events.map((event) => ({
      userId: objectUserId,
      type: event.type,
      domain: event.domain,
      url: event.url,
      timestamp: event.timestamp || Date.now(),
      metadata: event.metadata || {},
    }));

    // Store in database
    const result = await ExtensionTracking.insertMany(processedEvents);

    console.log(
      `📊 Tracked ${events.length} events for user ${userId}`
    );

    // Invalidate analytics cache since new data came in
    await deletePatternCache(`analytics:*:${userId}`);
    await deleteCache(`analytics:summary:${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          processedCount: result.length,
          timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Extension tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to process tracking data' },
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve tracking stats for user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
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
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Get tracking stats for last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await ExtensionTracking.aggregate([
      {
        $match: {
          userId: objectUserId,
          timestamp: { $gte: startDate.getTime() },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalTime: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'time_on_page'] },
                { $ifNull: ['$metadata.timeSpent', 0] },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get top domains visited
    const topDomains = await ExtensionTracking.aggregate([
      {
        $match: {
          userId: objectUserId,
          timestamp: { $gte: startDate.getTime() },
          type: { $in: ['page_visit', 'time_on_page'] },
        },
      },
      {
        $group: {
          _id: '$domain',
          visits: {
            $sum: { $cond: [{ $eq: ['$type', 'page_visit'] }, 1, 0] },
          },
          totalTime: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'time_on_page'] },
                { $ifNull: ['$metadata.timeSpent', 0] },
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { visits: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get domains with paywalls
    const paywallDomains = await ExtensionTracking.aggregate([
      {
        $match: {
          userId: objectUserId,
          type: 'paywall_detected',
          timestamp: { $gte: startDate.getTime() },
        },
      },
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get domains with ads
    const adDomains = await ExtensionTracking.aggregate([
      {
        $match: {
          userId: objectUserId,
          type: 'ad_detected',
          timestamp: { $gte: startDate.getTime() },
        },
      },
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get subscription mentions
    const subscriptionMentions = await ExtensionTracking.aggregate([
      {
        $match: {
          userId: objectUserId,
          type: 'subscription_mention',
          timestamp: { $gte: startDate.getTime() },
        },
      },
      {
        $group: {
          _id: null,
          domains: { $addToSet: '$domain' },
          totalMentions: { $sum: 1 },
          mentions: {
            $push: '$metadata.mentions',
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          stats: stats.reduce(
            (acc, stat) => {
              acc[stat._id] =
                stat._id === 'time_on_page' ? stat.totalTime : stat.count;
              return acc;
            },
            {} as Record<string, number>
          ),
          topDomains: topDomains.map((domain) => ({
            domain: domain._id,
            visits: domain.visits,
            totalTime: domain.totalTime || 0,
          })),
          paywallDomains: paywallDomains.map((domain) => ({
            domain: domain._id,
            count: domain.count,
          })),
          adDomains: adDomains.map((domain) => ({
            domain: domain._id,
            count: domain.count,
          })),
          subscriptionMentions:
            subscriptionMentions.length > 0
              ? {
                  totalMentions: subscriptionMentions[0].totalMentions,
                  domains: subscriptionMentions[0].domains,
                }
              : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get tracking stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch stats' },
      },
      { status: 500 }
    );
  }
}
