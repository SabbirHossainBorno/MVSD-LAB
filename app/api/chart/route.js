import { NextResponse } from 'next/server';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to fetch messages for chart
const getMessagesChartData = async (days) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        DATE(date) AS date, 
        COUNT(id) AS count
      FROM 
        home_contact_us 
      WHERE 
        date >= NOW() - INTERVAL '${days} days'
      GROUP BY 
        DATE(date)
      ORDER BY 
        DATE(date) ASC
    `;
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw new Error('Failed to fetch chart data');
  } finally {
    client.release();
  }
};

// API handler
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get('days') || 7; // Default to 7 days if no parameter is provided

  try {
    const data = await getMessagesChartData(days);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}