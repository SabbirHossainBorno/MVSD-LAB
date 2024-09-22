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
  const email = request.cookies.get('email');
  const sessionId = request.cookies.get('sessionId');
  const lastActivity = request.cookies.get('lastActivity');
  const userIp = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';

  if (!email || !sessionId) {
    const alertMessage = `MVSD LAB DASHBOARD\n------------------------------------\nUnauthorized Access Attempt!\nIP : ${userIp}`;
    await logAndAlert(alertMessage, sessionId, { email, userIp });
    return NextResponse.json({ authenticated: false });
  }

  try {
    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const diff = now - lastActivityDate;

    const alertMessage = `MVSD LAB DASHBOARD\n------------------------------------\nAuthentication Check Successful\nIP : ${userIp}`;
    await logAndAlert(alertMessage, sessionId, { email, lastActivity, userIp });

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    const alertMessage = `Error during authentication check\nIP: ${userIp}`;
    await logAndAlert(alertMessage, sessionId, { error: error.message, userIp });
    console.error('Error during authentication check:', error);
    return NextResponse.json({ authenticated: false, message: 'Internal server error' });
  }
}
