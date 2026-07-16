import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User.model';
import { loginSchema } from '@/lib/validation';
import { generateTokens } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await User.findOne({ email: validatedData.email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

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
          accessToken,
          ...(request.headers.get('x-subtrack-client') === 'extension'
            ? { refreshToken }
            : {}),
        },
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
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
