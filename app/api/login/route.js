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

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
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
  const sessionId = uuidv4();

  // Extract IP address and User-Agent
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    log(`Login attempt for email: ${email} from IP: ${ipAddress}, Device: ${userAgent}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nLogin Attempt.\nEmail: ${email}\nIP: ${ipAddress}`);

    const checkUser = async (table) => {
      const res = await client.query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2`, [email, password]);
      if (res.rows.length > 0) {
        log(`${table === 'admin' ? 'Admin' : 'User'} login successful for email: ${email} from IP: ${ipAddress}, Device: ${userAgent}`, sessionId);
        await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\n${table === 'admin' ? 'Admin' : 'User'} Login Successful.\nEmail: ${email}\nIP: ${ipAddress}`);
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

    log(`Login failed for email: ${email} from IP: ${ipAddress}, Device: ${userAgent}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nLogin Failed.\nEmail: ${email}\nIP: ${ipAddress}`);
    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    log(`Error during login for email: ${email} from IP: ${ipAddress}, Device: ${userAgent} - ${error.message}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nError During Login.\nEmail: ${email}\nIP: ${ipAddress}\nError: ${error.message}`);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
