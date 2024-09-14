import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is correct
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Check if the email already exists
      const checkResult = await client.query(
        'SELECT email FROM subscriber WHERE email = $1',
        [email]
      );

      if (checkResult.rows.length > 0) {
        return NextResponse.json({ success: false, message: 'You are already a subscriber.' }, { status: 400 });
      }

      // Insert new subscriber with current date
      const result = await client.query(
        'INSERT INTO subscriber (email, date) VALUES ($1, NOW()) RETURNING serial',
        [email]
      );

      const { serial } = result.rows[0];

      return NextResponse.json({ success: true, message: 'Subscription successful!', serial });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
