// app/api/login/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
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
  

export async function POST(request) {
  const { email, password } = await request.json();
  const client = await pool.connect();
  const sessionId = uuidv4();

  // Extract IP address and User-Agent
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    await logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nLogin Attempt!\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}`, sessionId);

    const checkUser = async (table) => {
      const res = await client.query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2`, [email, password]);
      if (res.rows.length > 0) {
        await logAndAlert(`${table === 'admin' ? 'MVSD LAB DASHBOARD\n------------------------------------\nAdmin' : 'User'} Login Successful.\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}`, sessionId);
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

    await logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nLogin Failed!\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}`, sessionId);
    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    await logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nError During Login!\nEmail : ${email}\nIP : ${ipAddress},\nDevice INFO : ${userAgent} - ${error.message}`, sessionId);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
