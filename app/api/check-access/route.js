// app/api/check-access/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request) {
  const email = request.cookies.get('email');
  const sessionId = request.cookies.get('sessionId');
  const lastActivity = request.cookies.get('lastActivity');

  if (!email || !sessionId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' });
  }

  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diff = now - lastActivityDate;

  if (diff > 10 * 60 * 1000) { // 10 minutes
    return NextResponse.json({ success: false, message: 'Session expired' });
  }

  if (email === 'admin@mvsdlab.com') {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false });
  }
}
