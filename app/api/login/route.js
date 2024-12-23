// app/api/login/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logWrite = async (message, eid, sid, status, taskName, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-write`, { message, eid, sid, status, taskName, details });
  } catch (error) {
    console.error('Failed to write log:', error);
  }
};

const sendTelegramAlert = async (message) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/telegram-alert`, { message });
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
};

const generateEID = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `${randomNumber}-MVSDLAB`;
};

export async function POST(request) {
  const { email, password } = await request.json();
  const client = await pool.connect();
  const sessionId = uuidv4();
  const eid = generateEID(); // Generate a new execution ID for successful logins

  // Extract IP address and User-Agent
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    await logWrite(`Login Attempt`, '', sessionId, 'WARN', 'LoginAttempt', { email, ipAddress, userAgent });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n------------------------------------\nLogin Attempt!\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}`);

    const checkUser = async (table) => {
      const res = await client.query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2`, [email, password]);
      if (res.rows.length > 0) {
        await logWrite(`${table === 'admin' ? 'Admin' : 'User'} Login Successful`, eid, sessionId, 'SUCCESS', 'Login', { email, ipAddress, userAgent });
        await sendTelegramAlert(`${table === 'admin' ? 'MVSD LAB DASHBOARD\n------------------------------------\nAdmin' : 'User'} Login Successful.\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}`);
        const response = NextResponse.json({ success: true, type: table === 'admin' ? 'admin' : 'user' });
        response.cookies.set('email', email, { httpOnly: true });
        response.cookies.set('sessionId', sessionId, { httpOnly: true });
        response.cookies.set('eid', eid, { httpOnly: true });
        return response;
      }
      return null;
    };

    const adminResponse = await checkUser('admin');
    if (adminResponse) return adminResponse;

    const userResponse = await checkUser('users');
    if (userResponse) return userResponse;

    await logWrite(`Login Failed`, '', sessionId, 'ERROR', 'Login', { email, ipAddress, userAgent });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n------------------------------------\nLogin Failed!\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}`);
    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    await logWrite(`Error During Login`, '', sessionId, 'ERROR', 'Login', { email, ipAddress, userAgent, error: error.message });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n------------------------------------\nError During Login!\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent} - ${error.message}`);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}