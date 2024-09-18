// app/api/login/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logFilePath = path.resolve('/home/mvsd-lab/Log', 'mvsd_lab.log'); // Use path.resolve for absolute path

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY; // Consider using environment variables
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

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
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nLogin Attempt.\nEmail: ${email}`);

    // Check user in admin table
    const adminRes = await client.query('SELECT * FROM admin WHERE email = $1', [email]);
    if (adminRes.rows.length > 0) {
      const admin = adminRes.rows[0];
      if (await bcrypt.compare(password, admin.password)) {
        log(`Admin login successful for email: ${email}`, sessionId);
        await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nAdmin Login Successful.\nEmail: ${email}`);
        const response = NextResponse.json({ success: true, type: 'admin' });
        response.cookies.set('email', email, { httpOnly: true });
        response.cookies.set('sessionId', sessionId, { httpOnly: true });
        return response;
      }
    }

    // Check user in users table
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      if (await bcrypt.compare(password, user.password)) {
        log(`User login successful for email: ${email}`, sessionId);
        await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nLogin Successful.\nEmail: ${email}`);
        const response = NextResponse.json({ success: true, type: 'user' });
        response.cookies.set('email', email, { httpOnly: true });
        response.cookies.set('sessionId', sessionId, { httpOnly: true });
        return response;
      }
    }

    log(`Login failed for email: ${email}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nLogin Failed.\nEmail: ${email}`);
    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    log(`Error during login for email: ${email} - ${error.message}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nError During Login.\nEmail: ${email} - ${error.message}`);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
