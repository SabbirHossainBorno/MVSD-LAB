import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Existing GET function to fetch the dashboard data
export async function GET() {
  const client = await pool.connect();
  try {
    const subscriberCountQuery = 'SELECT COUNT(*) FROM subscriber';
    const userDetailsQuery = 'SELECT * FROM users';
    const professorDetailsQuery = 'SELECT COUNT(*) AS count FROM professor_basic_info'; // Total professors count
    const recentProfessorsQuery = 'SELECT id, first_name, last_name, phone, dob, email, short_bio, joining_date, leaving_date, photo, status, type FROM professor_basic_info ORDER BY id DESC LIMIT 5';
    const recentSubscribersQuery = 'SELECT * FROM subscriber ORDER BY date DESC LIMIT 7';
    const recentUsersQuery = 'SELECT * FROM users WHERE status = \'approved\' ORDER BY id DESC LIMIT 5';

    const subscriberCount = await client.query(subscriberCountQuery);
    const userDetails = await client.query(userDetailsQuery);
    const professorDetails = await client.query(professorDetailsQuery);
    const recentSubscribers = await client.query(recentSubscribersQuery);
    const recentUsers = await client.query(recentUsersQuery);
    const recentProfessors = await client.query(recentProfessorsQuery);

    return NextResponse.json({
      subscribers: subscriberCount.rows[0].count,
      users: userDetails.rows,
      professorCount: professorDetails.rows[0].count, // Total professor count
      recentSubscribers: recentSubscribers.rows,
      recentUsers: recentUsers.rows,
      recentProfessors: recentProfessors.rows, // Recent professors
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  } finally {
    client.release();
  }
}

// New POST function to update user status
export async function POST(req) {
  const { userId, newStatus } = await req.json();
  const client = await pool.connect();
  try {
    const updateStatusQuery = 'UPDATE users SET status = $1 WHERE id = $2 RETURNING *';
    const updatedUser = await client.query(updateStatusQuery, [newStatus, userId]);

    return NextResponse.json({
      message: 'User status updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ message: 'Failed to update user status' }, { status: 500 });
  } finally {
    client.release();
  }
}
