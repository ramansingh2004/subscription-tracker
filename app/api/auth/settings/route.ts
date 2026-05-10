import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import {User} from '@/models/User.model';
import { verifyAccessToken } from '@/lib/jwt';
import { z } from 'zod';

// Validation schema for settings
const settingsSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  currency: z.string().optional(),
  notificationFrequency: z
    .enum(['instant', 'daily', 'weekly'])
    .optional(),
  emailNotifications: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    // Verify token
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

    // Get request body
    const body = await req.json();

    // Validate input
    const validated = settingsSchema.parse(body);

    // Find user
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    // Update basic info
    if (validated.firstName) {
      user.firstName = validated.firstName;
    }
    if (validated.lastName) {
      user.lastName = validated.lastName;
    }
    if (validated.email && validated.email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({
        email: validated.email,
      });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Email already in use' },
          },
          { status: 400 }
        );
      }
      user.email = validated.email;
    }

    // Update preferences
    if (!user.preferences) {
      user.preferences = {
        theme: 'light',
        currency: 'USD',
        notificationFrequency: 'daily',
        emailNotifications: true,
      };
    }

    if (validated.theme) {
      user.preferences.theme = validated.theme;
    }
    if (validated.currency) {
      user.preferences.currency = validated.currency;
    }
    if (validated.notificationFrequency) {
      user.preferences.notificationFrequency =
        validated.notificationFrequency;
    }
    if (validated.emailNotifications !== undefined) {
      user.preferences.emailNotifications =
        validated.emailNotifications;
    }

    // Save user
    await user.save();

    // Return updated user
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            preferences: user.preferences,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current settings
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Verify token
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

    // Find user
    const user = await User.findById(payload.userId).select(
      '-password'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { user },
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