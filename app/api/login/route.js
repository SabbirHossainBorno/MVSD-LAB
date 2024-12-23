// app/api/login/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request) {
  const { email, password } = await request.json();
  const client = await pool.connect();

  // Extract IP address and User-Agent
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const checkUser = async (table) => {
      const res = await client.query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2`, [email, password]);
      if (res.rows.length > 0) {
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

    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
