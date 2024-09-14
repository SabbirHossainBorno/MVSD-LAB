// app/api/signup/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is correct
});

export async function POST(request) {
  try {
    const { firstName, lastName, phone, dob, email, password, confirmPassword } = await request.json();

    // Validate required fields
    const errors = {};
    if (!firstName) errors.firstName = 'First name is required.';
    if (!lastName) errors.lastName = 'Last name is required.';
    if (!phone) errors.phone = 'Phone number is required.';
    if (!dob) errors.dob = 'Date of birth is required.';
    if (!email) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    if (!confirmPassword) errors.confirmPassword = 'Confirm password is required.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Validate password
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,16}$/;
    if (!passwordPattern.test(password)) {
      errors.password = 'Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, and one special symbol.';
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // Validate date of birth for age
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      errors.dob = 'Please provide a valid date of birth. You must be at least 18 years old.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Check if email already exists
      const emailCheckResult = await client.query('SELECT email FROM users WHERE email = $1', [email]);
      if (emailCheckResult.rows.length > 0) {
        return NextResponse.json({ success: false, errors: { email: 'A user with that email already exists, please try with another email.' } }, { status: 400 });
      }

      // Insert new user
      await client.query(
        'INSERT INTO users (first_name, last_name, phone, dob, email, password, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [firstName, lastName, phone, dob, email, password, 'pending']
      );

      // Redirect to login page
      //return NextResponse.redirect('/login');
      // Return success response
      return NextResponse.json({ success: true, message: 'User registered successfully.' }, { status: 200 });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ success: false, errors: { general: 'Database error' } }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ success: false, errors: { general: 'Invalid request' } }, { status: 400 });
  }
}
