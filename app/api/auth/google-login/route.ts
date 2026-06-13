import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User.model';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import axios from 'axios';

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
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${credential}`
    );

    const {
      email,
      name,
      picture,
      id: googleId,
    } = googleData.data;

    if (!email) {
      return NextResponse.json(
        { message: 'Email not provided by Google' },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || '');

    // Try to find user by Google ID first, then by email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      return NextResponse.json(
        { 
          message: 'User not found. Please sign up first.',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update user's Google info if needed
    if (!user.googleId) {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          googleId,
          googleEmail: email,
          googleName: name,
          googleImage: picture,
          oauthProvider: 'google',
        },
        { new: true }
      );
    }

    // Generate JWT
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        provider: 'google',
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '30d' }
    );

    return NextResponse.json(
      {
        data: {
          accessToken,
          refreshToken,
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
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Google login failed',
        error: error.message,
      },
      { status: 400 }
    );
  }
}