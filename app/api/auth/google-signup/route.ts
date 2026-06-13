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
      verified_email,
    } = googleData.data;

    if (!email) {
      return NextResponse.json(
        { message: 'Email not provided by Google' },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || '');

    let user = await User.findOne({ email });

    if (user) {
      // User already exists with this email
      // Update with Google info if not already linked
      if (!user.googleId) {
        user = await User.findByIdAndUpdate(
          user._id,
          {
            googleId,
            googleEmail: email,
            googleName: name,
            googleImage: picture,
            emailVerified: verified_email || user.emailVerified,
            oauthProvider: 'google',
          },
          { new: true }
        );
      }
    } else {
      // Create new user from Google
      const names = name?.split(' ') || [''];
      user = await User.create({
        email,
        googleId,
        googleEmail: email,
        googleName: name,
        googleImage: picture,
        firstName: names[0] || undefined,
        lastName: names.slice(1).join(' ') || undefined,
        emailVerified: verified_email || false,
        oauthProvider: 'google',
      });
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
    console.error('Google signup error:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Google signup failed',
        error: error.message,
      },
      { status: 400 }
    );
  }
}