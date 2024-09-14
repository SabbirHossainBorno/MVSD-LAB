// /app/api/subscribers_list/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const client = await pool.connect();
  try {
    const query = 'SELECT email, date FROM subscriber';
    const result = await client.query(query);

    return NextResponse.json({ subscribers: result.rows });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ message: 'Failed to fetch subscribers' }, { status: 500 });
  } finally {
    client.release();
  }
}
