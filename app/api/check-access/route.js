import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request) {
  const email = request.cookies.get('email');
  const sessionId = request.cookies.get('sessionId');
  const lastActivity = request.cookies.get('lastActivity');
  const rememberMe = request.cookies.get('rememberMe');

  if (!email || !sessionId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' });
  }

  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diff = now - lastActivityDate;

  const sessionExpiry = rememberMe === 'true' ? 30 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000; // 30 days or 10 minutes

  if (diff > sessionExpiry) {
    return NextResponse.json({ success: false, message: 'Session expired' });
  }

  try {
    const client = await pool.connect();

    // Validate session ID
    const sessionResult = await client.query('SELECT * FROM sessions WHERE session_id = $1 AND email = $2', [sessionId, email]);
    if (sessionResult.rowCount === 0) {
      client.release();
      return NextResponse.json({ success: false, message: 'Invalid session' });
    }

    // Check user role
    const userResult = await client.query('SELECT role FROM users WHERE email = $1', [email]);
    client.release();

    if (userResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const userRole = userResult.rows[0].role;
    if (userRole === 'admin') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('lastActivity', new Date().toISOString(), { httpOnly: true });
      return response;
    } else {
      return NextResponse.json({ success: false, message: 'Access denied' });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  }
}
