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

// Helper function to fetch total messages for a given period
const getTotalMessages = async (days) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        COUNT(id) AS count
      FROM 
        home_contact_us 
      WHERE 
        date >= NOW() - INTERVAL '${days} days'
    `;
    const result = await client.query(query);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error fetching total messages:', error);
    throw new Error('Failed to fetch total messages');
  } finally {
    client.release();
  }
};

// API handler
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days')) || 7; // Default to 7 days if no parameter is provided

  try {
    const currentData = await getMessagesChartData(days);
    const previousData = await getMessagesChartData(days * 2); // Fetch data for the previous period

    const currentTotal = currentData.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
    const previousTotal = previousData.reduce((sum, item) => sum + parseInt(item.count, 10), 0);

    const percentageChange = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

    console.log('Current Data:', currentData);
    console.log('Previous Data:', previousData);
    console.log('Current Total:', currentTotal);
    console.log('Previous Total:', previousTotal);
    console.log('Percentage Change:', percentageChange);

    return NextResponse.json({ data: currentData, totalMessages: currentTotal, percentageChange });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}