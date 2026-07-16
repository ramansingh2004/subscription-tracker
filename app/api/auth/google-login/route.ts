import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User.model';
import axios from 'axios';
import dbConnect from '@/lib/mongodb';
import { generateTokens } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';
export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { message: 'Missing credential' },
        { status: 400 }
      );
    }

    // Verify Google token and get user info
    const googleData = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${credential}` } }
    );

    const {
      email,
      name,
      picture,
      id: googleId,
      verified_email: verifiedEmail,
    } = googleData.data;

    if (!email) {
      return NextResponse.json(
        { message: 'Email not provided by Google' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Try to find user by Google ID first, then by email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      const names = name?.trim().split(/\s+/) || [];
      user = await User.create({
        email,
        googleId,
        googleEmail: email,
        googleName: name,
        googleImage: picture,
        firstName: names[0] || undefined,
        lastName: names.slice(1).join(' ') || undefined,
        emailVerified: Boolean(verifiedEmail),
        oauthProvider: 'google',
      });
    } else {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          googleId,
          googleEmail: email,
          googleName: name,
          googleImage: picture,
          emailVerified: Boolean(verifiedEmail) || user.emailVerified,
          oauthProvider: 'google',
        },
        { new: true }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Unable to link Google account' },
        { status: 500 }
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const response = NextResponse.json(
      {
        data: {
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.firstName || user.googleName || 'User',
            image: user.googleImage,
            provider: 'google',
          },
        },
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    console.error('Google login error:', error);
    const message = error instanceof Error ? error.message : 'Google login failed';
    return NextResponse.json(
      { 
        message,
      },
      { status: 400 }
    );
  }
}
