// app/api/login/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db'; // Centralized database query handling
import { sendLogWrite } from '../log-write/route.js'; // Log-write API
import { sendTelegramAlert } from '../telegram-alert/route.js'; // Telegram-alert API

export async function POST(request) {
  const { email, password } = await request.json();
  const sessionId = uuidv4(); // Create session ID
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    // Check if user exists in admin or users table
    const userCheckQuery = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    const adminCheckQuery = 'SELECT * FROM admin WHERE email = $1 AND password = $2';

    let res = await query(adminCheckQuery, [email, password]); // Use centralized query function
    if (res.rows.length > 0) {
      // Successful login for admin
      await Promise.all([
        sendLogWrite({
          eid: sessionId,
          sid: sessionId,
          task: 'login',
          details: { email, ipAddress, userAgent },
          status: 'SUCCESS',
        }),
        sendTelegramAlert({
          message: `Admin login successful: ${email} from IP: ${ipAddress}`,
        }),
      ]);
      return NextResponse.json({ success: true, type: 'admin' });
    }

    res = await query(userCheckQuery, [email, password]); // Use centralized query function
    if (res.rows.length > 0) {
      // Successful login for user
      await Promise.all([
        sendLogWrite({
          eid: sessionId,
          sid: sessionId,
          task: 'login',
          details: { email, ipAddress, userAgent },
          status: 'SUCCESS',
        }),
        sendTelegramAlert({
          message: `User login successful: ${email} from IP: ${ipAddress}`,
        }),
      ]);
      return NextResponse.json({ success: true, type: 'user' });
    }

    // Failed login
    await Promise.all([
      sendLogWrite({
        eid: '',
        sid: sessionId,
        task: 'login',
        details: { email, ipAddress, userAgent },
        status: 'ERROR',
      }),
      sendTelegramAlert({
        message: `Login failed for: ${email} from IP: ${ipAddress}`,
      }),
    ]);
    return NextResponse.json({ success: false, message: 'Invalid email or password' });

  } catch (error) {
    console.error('Login error:', error);

    // Log the error
    await Promise.all([
      sendLogWrite({
        eid: '',
        sid: sessionId,
        task: 'login',
        details: { email, ipAddress, userAgent, error: error.message },
        status: 'ERROR',
      }),
      sendTelegramAlert({
        message: `Error during login attempt for ${email}: ${error.message}`,
      }),
    ]);

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
