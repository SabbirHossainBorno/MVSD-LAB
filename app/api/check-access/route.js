// app/api/check-access/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    await axios.post('/api/log-and-alert', { message, sessionId, details });
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
      return NextResponse.json({ success: false, message: 'Unauthorized' });
    }

    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const diff = now - lastActivityDate;

    if (diff > 10 * 60 * 1000) { // 10 minutes
      await logAndAlert('Session expired', sessionId, { email });
      return NextResponse.json({ success: false, message: 'Session Expired. Please Login Again!' });
    }

    const client = await pool.connect();

    try {
      // Validate session ID
      const sessionResult = await client.query('SELECT * FROM sessions WHERE session_id = $1 AND email = $2', [sessionId, email]);
      if (sessionResult.rowCount === 0) {
        return NextResponse.json({ success: false, message: 'Invalid Session' });
      }

      // Check user role
      const userResult = await client.query('SELECT role FROM users WHERE email = $1', [email]);
      if (userResult.rowCount === 0) {
        return NextResponse.json({ success: false, message: 'User not found' });
      }

      const userRole = userResult.rows[0].role;
      if (userRole === 'admin') {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, message: 'Access Denied' });
      }
