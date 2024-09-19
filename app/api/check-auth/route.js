// app/api/check-auth/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const email = request.cookies.get('email');
  const sessionId = request.cookies.get('sessionId');
  const lastActivity = request.cookies.get('lastActivity');
  const rememberMe = request.cookies.get('rememberMe');

  if (!email || !sessionId) {
    return NextResponse.json({ authenticated: false });
  }

  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diff = now - lastActivityDate;

  const sessionExpiry = rememberMe === 'true' ? 30 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000; // 30 days or 10 minutes

  if (diff > sessionExpiry) {
    return NextResponse.json({ authenticated: false, message: 'Session expired' });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set('lastActivity', new Date().toISOString(), { httpOnly: true });
  return response;
}
