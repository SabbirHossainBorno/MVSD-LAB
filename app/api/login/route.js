import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendLogWrite } from '../log-write/route'; // Ensure the path is correct
import { sendTelegramAlert } from '../telegram-alert/route'; // Ensure the path is correct
import { query } from '../../../lib/db'; // Ensure correct DB query helper

export async function POST(request) {
  // Manually parse the incoming JSON body from the request
  const { email, password } = await request.json();
  
  const sessionId = uuidv4(); // Create a unique session ID for every request
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    // Query to check if the user exists in the database
    const userCheckQuery = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    const res = await query(userCheckQuery, [email, password]);

    if (res.rows.length > 0) {
      // Successful login
      await sendLogWrite({
        eid: sessionId,  // Set the execution ID for successful login
        sid: sessionId,  // Use session ID for logging
        task: 'login',  // Specify task as 'login'
        details: { email, ipAddress, userAgent },  // Log user info and request details
        status: 'SUCCESS',  // Status of the operation
      });

      // Send Telegram alert for successful login
      await sendTelegramAlert({
        message: `User login successful: ${email} from IP: ${ipAddress}`,
      });

      return NextResponse.json({ success: true, type: 'user' });
    }

    // Failed login attempt
    await sendLogWrite({
      eid: '',  // No execution ID for failed login
      sid: sessionId,  // Use session ID for logging
      task: 'login',  // Task is still 'login'
      details: { email, ipAddress, userAgent },  // Log user info and request details
      status: 'ERROR',  // Status for failed login attempt
    });

    // Send Telegram alert for failed login
    await sendTelegramAlert({
      message: `Login failed for: ${email} from IP: ${ipAddress}`,
    });

    return NextResponse.json({ success: false, message: 'Invalid email or password' });

  } catch (error) {
    console.error('Login error:', error);

    // Log the error for any issues during login
    await sendLogWrite({
      eid: '',  // No execution ID for error logs
      sid: sessionId,  // Use session ID for error logging
      task: 'login',  // Task is still 'login'
      details: { email, ipAddress, userAgent, error: error.message },  // Include error message in log
      status: 'ERROR',  // Status for error logs
    });

    // Send Telegram alert for the error
    await sendTelegramAlert({
      message: `Error during login attempt for ${email}: ${error.message}`,
    });

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
