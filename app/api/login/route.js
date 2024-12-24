// app/api/login/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger'; // Import the logger

export async function POST(request) {
  const { email, password } = await request.json();
  const sessionId = uuidv4();

  // Extract IP address and User-Agent
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const checkUser = async (table) => {
      const res = await query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2`, [email, password]);
      if (res.rows.length > 0) {
        logger.info(`Login successful for ${email}`, { sessionId, ipAddress, userAgent });
        const response = NextResponse.json({ success: true, type: table === 'admin' ? 'admin' : 'user' });
        response.cookies.set('email', email, { httpOnly: true });
        response.cookies.set('sessionId', sessionId, { httpOnly: true });
        return response;
      }
      return null;
    };

    const adminResponse = await checkUser('admin');
    if (adminResponse) return adminResponse;

    const userResponse = await checkUser('users');
    if (userResponse) return userResponse;

    logger.warn(`Login failed for ${email}`, { sessionId, ipAddress, userAgent });
    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    logger.error(`Error during login for ${email}: ${error.message}`, { sessionId, ipAddress, userAgent });
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}