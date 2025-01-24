// /app/api/users_list/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const client = await pool.connect();
  try {
    const query = 'SELECT id, first_name, last_name, phone, dob, email, status FROM users';
    const result = await client.query(query);

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  } finally {
    client.release();
  }
}
