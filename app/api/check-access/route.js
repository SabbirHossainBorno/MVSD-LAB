// app/api/check-access/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

  if (!email || !sessionId) {
    await logAndAlert('Unauthorized Access Attempt', sessionId, { email });
    return NextResponse.json({ success: false, message: 'Unauthorized' });
  }

  const client = await pool.connect();

  try {
    // Validate session ID
    const sessionResult = await client.query('SELECT * FROM sessions WHERE session_id = $1 AND email = $2', [sessionId, email]);
    if (sessionResult.rowCount === 0) {
      await logAndAlert('Invalid session ID', sessionId, { email });
      return NextResponse.json({ success: false, message: 'Invalid Session' });
    }

    // Check user role
    const userResult = await client.query('SELECT role FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
      await logAndAlert('User not found', sessionId, { email });
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const userRole = userResult.rows[0].role;
    if (userRole === 'admin') {
      await logAndAlert('Admin access granted', sessionId, { email });
      return NextResponse.json({ success: true });
    } else {
      await logAndAlert('Access denied', sessionId, { email, role: userRole });
      return NextResponse.json({ success: false, message: 'Access Denied' });
    }
  } catch (error) {
    await logAndAlert('Database query failed', sessionId, { error: error.message });
    console.error('Database query failed:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
}
