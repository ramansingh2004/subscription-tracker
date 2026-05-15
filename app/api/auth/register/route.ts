import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User.model';
import { registerSchema } from '@/lib/validation';
import { generateTokens } from '@/lib/jwt';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: validatedData.email }, { username: validatedData.username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Email or username already exists',
            code: 'USER_EXISTS',
          },
        },
        { status: 400 }
      );
    }

    // Create user
    const user = new User({
      email: validatedData.email,
      username: validatedData.username,
      passwordHash: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      emailVerified: true, // Auto-verify for demo
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          accessToken, // ✅ Include in response body
          refreshToken, // ✅ Also include for frontend (will use httpOnly cookie as backup)
        },
      },
      { status: 201 }
    );

    // Set refresh token in httpOnly cookie (secure backup)
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}