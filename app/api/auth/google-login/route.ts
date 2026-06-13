import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User.model';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    // Verify Google token
    const googleData = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${credential}`
    );

    const { email, id: googleId } = googleData.data;

    await mongoose.connect(process.env.MONGODB_URI || '');

    const user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    // Generate JWT
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        data: {
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.firstName || user.googleName,
            image: user.googleImage,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { message: error.message || 'Google login failed' },
      { status: 400 }
    );
  }
}