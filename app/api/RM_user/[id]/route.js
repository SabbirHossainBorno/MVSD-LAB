import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Handle GET request
export async function GET(req, { params }) {
  const client = await pool.connect();
  try {
    const { id } = params;
    const query = 'SELECT id, first_name, last_name, phone, dob, email, status FROM users WHERE id = $1';
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Failed to fetch user', error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// Handle PATCH request
export async function PATCH(req, { params }) {
  const client = await pool.connect();
  try {
    const { id } = params;
    const { first_name, last_name, phone, email, status, newPassword, confirmNewPassword } = await req.json();

    const trimmedNewPassword = newPassword?.trim();
    const trimmedConfirmNewPassword = confirmNewPassword?.trim();

    if (trimmedNewPassword && trimmedNewPassword !== trimmedConfirmNewPassword) {
      return NextResponse.json({ message: 'New passwords do not match' }, { status: 400 });
    }

    const queryParams = [first_name, last_name, phone, email, status];
    let query = `
      UPDATE users
      SET first_name = $1, last_name = $2, phone = $3, email = $4, status = $5
    `;

    if (trimmedNewPassword) {
      query += ', password = $6';
      queryParams.push(trimmedNewPassword);
    }

    query += ' WHERE id = $' + (trimmedNewPassword ? '7' : '6');
    queryParams.push(id);

    await client.query(query, queryParams);

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
