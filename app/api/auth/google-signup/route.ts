import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User.model';
import { generateTokens } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Google credential is required' },
        },
        { status: 400 }
      );
    }

    // Exchange the access token for user profile info from Google
    const googleRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${credential}` } }
    );

    if (!googleRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid Google credential' },
        },
        { status: 401 }
      );
    }

    const googleProfile = await googleRes.json();

    // Check if user already exists by googleId or email
    let user = await User.findOne({
      $or: [
        { googleId: googleProfile.sub },
        { email: googleProfile.email },
      ],
    });

    if (user) {
      // Update existing user with latest Google info
      user.googleId = googleProfile.sub;
      user.googleEmail = googleProfile.email;
      user.googleName = googleProfile.name;
      user.googleImage = googleProfile.picture;
      user.emailVerified = googleProfile.email_verified || user.emailVerified;
      await user.save();
    } else {
      // Create a new user from Google profile
      // Generate a unique username from the email prefix
      const baseUsername = googleProfile.email.split('@')[0];
      const uniqueUsername = `${baseUsername}_${Date.now().toString(36)}`;

      user = await User.create({
        email: googleProfile.email,
        username: uniqueUsername,
        passwordHash: `google_oauth_${Date.now()}`, // Placeholder — user won't login with password
        googleId: googleProfile.sub,
        googleEmail: googleProfile.email,
        googleName: googleProfile.name,
        googleImage: googleProfile.picture,
        firstName: googleProfile.given_name,
        lastName: googleProfile.family_name,
        emailVerified: googleProfile.email_verified || false,
        oauthProvider: 'google',
      });
    }

    // Generate JWT tokens (same as login/register endpoints)
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
            googleImage: user.googleImage,
          },
          accessToken,
        },
      },
      { status: 200 }
    );

    // Set refresh token in httpOnly cookie
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
    console.error('Google signup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Internal server error' },
      },
      { status: 500 }
    );
  }
}
