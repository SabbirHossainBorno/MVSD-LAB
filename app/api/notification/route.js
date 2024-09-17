import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const client = await pool.connect();
  try {
    const notificationsQuery = 'SELECT * FROM notification_details ORDER BY created_at DESC';
    const notifications = await client.query(notificationsQuery);

    return NextResponse.json(notifications.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request) {
  const client = await pool.connect();
  try {
    const { notificationId, status } = await request.json();
    const updateQuery = 'UPDATE notification_details SET status = $1 WHERE id = $2';
    await client.query(updateQuery, [status, notificationId]);

    return NextResponse.json({ message: 'Notification status updated successfully' });
  } catch (error) {
    console.error('Error updating notification status:', error);
    return NextResponse.json({ message: 'Failed to update notification status' }, { status: 500 });
  } finally {
    client.release();
  }
}
