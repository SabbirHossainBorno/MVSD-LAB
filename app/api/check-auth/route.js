// app/api/check-auth/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

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

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Error during authentication check:', error);
    return NextResponse.json({ authenticated: false, message: 'Internal server error' });
  }
}
