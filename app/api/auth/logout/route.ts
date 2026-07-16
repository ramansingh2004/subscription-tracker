import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-cookies';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: { message: 'Logged out successfully' },
      },
      { status: 200 }
    );

    clearAuthCookies(response);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
