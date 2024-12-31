//app/api/profile/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; // Ensure this path is correct

export async function GET(request) {
  const email = request.cookies.get('email')?.value;

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query('SELECT * FROM admin WHERE email = $1', [email]);
    const profile = result.rows[0];

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}