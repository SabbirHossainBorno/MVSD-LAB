// app/api/check-auth/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const email = request.cookies.get('email');
    const sessionId = request.cookies.get('sessionId');
    const lastActivity = request.cookies.get('lastActivity');

    if (!email || !sessionId) {
      return NextResponse.json({ authenticated: false });
    }

    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const diff = now - lastActivityDate;

    if (diff > 10 * 60 * 1000) { // 10 minutes
      return NextResponse.json({ authenticated: false, message: 'Session Expired. Please Login Again!' });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Error during authentication check:', error);
    return NextResponse.json({ authenticated: false, message: 'Internal server error' });
  }
}
