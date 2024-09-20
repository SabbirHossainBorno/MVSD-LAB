// app/api/check-auth/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
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
    return NextResponse.json({ authenticated: false, message: 'Session expired' });
  }

  return NextResponse.json({ authenticated: true });
}