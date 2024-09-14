import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request) {
  const { cookies } = request;
  const email = cookies.email; // Assuming you store email in cookies

  if (email === 'admin@mvsdlab.com') {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false });
  }
}

