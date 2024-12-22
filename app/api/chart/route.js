import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') || 7; // Default to 7 days if not specified

  // Fetch the messages count for the last 'days' from the database
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        DATE(date) AS date,
        COUNT(*) AS count
      FROM home_contact_us
      WHERE date >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(date)
      ORDER BY DATE(date) DESC
    `;
    const result = await client.query(query);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  } finally {
    client.release();
  }
}
