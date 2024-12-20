// /app/api/message/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import axios from 'axios';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

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

export async function GET() {
  const client = await pool.connect();
  try {
    const query = 'SELECT id, email, date FROM home_contact_us';
    const result = await client.query(query);

    return NextResponse.json({ message: result.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    await logAndAlert('Error fetching message', null, { error: error.message });
    return NextResponse.json({ message: 'Failed to fetch subscribers' }, { status: 500 });
  } finally {
    client.release();
  }
}
