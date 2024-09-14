// app/api/login/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request) {
  const { email, password } = await request.json();
  const client = await pool.connect();
  try {
    // Check user in admin table
    const adminRes = await client.query('SELECT * FROM admin WHERE email = $1 AND password = $2', [email, password]);
    if (adminRes.rows.length > 0) {
      const response = NextResponse.json({ success: true, type: 'admin' });
      response.cookies.set('email', email, { httpOnly: true });
      return response;
    }

    // Check user in users table
    const userRes = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (userRes.rows.length > 0) {
      const response = NextResponse.json({ success: true, type: 'user' });
      response.cookies.set('email', email, { httpOnly: true });
      return response;
    }

    return NextResponse.json({ success: false });
  } finally {
    client.release();
  }
}

