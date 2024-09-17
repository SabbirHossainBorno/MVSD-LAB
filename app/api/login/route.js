// app/api/login/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log');

const TELEGRAM_API_KEY = '7489554804:AAFZs1eZmjZ8H634tBPhtL54UsLZOi3vCxg';
const TELEGRAM_GROUP_ID = '-4285248556';

const log = (message, sessionId) => {
  const logMessage = `${new Date().toISOString()} [Session ID: ${sessionId}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
    });
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
};

export async function POST(request) {
  const { email, password } = await request.json();
  const client = await pool.connect();
  const sessionId = uuidv4(); // Generate a unique session ID for this login attempt

  try {
    log(`Login attempt for email: ${email}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nLogin attempt for email: ${email}`);

    // Check user in admin table
    const adminRes = await client.query('SELECT * FROM admin WHERE email = $1 AND password = $2', [email, password]);
    if (adminRes.rows.length > 0) {
      log(`Admin login successful for email: ${email}`, sessionId);
      await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nAdmin login successful for email: ${email}`);
      const response = NextResponse.json({ success: true, type: 'admin' });
      response.cookies.set('email', email, { httpOnly: true });
      response.cookies.set('sessionId', sessionId, { httpOnly: true });
      return response;
    }

    // Check user in users table
    const userRes = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (userRes.rows.length > 0) {
      log(`User login successful for email: ${email}`, sessionId);
      await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUser login successful for email: ${email}`);
      const response = NextResponse.json({ success: true, type: 'user' });
      response.cookies.set('email', email, { httpOnly: true });
      response.cookies.set('sessionId', sessionId, { httpOnly: true });
      return response;
    }

    log(`Login failed for email: ${email}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nLogin failed for email: ${email}`);
    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    log(`Error during login for email: ${email} - ${error.message}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nError during login for email: ${email} - ${error.message}`);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}


