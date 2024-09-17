// app/api/signup/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log');

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

const log = (message, sessionId, details = {}) => {
  const logMessage = `${new Date().toISOString()} [Session ID: ${sessionId}] ${message} ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
    });
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
};

export async function POST(request) {
  const sessionId = uuidv4(); // Generate a unique session ID for this signup attempt
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');

  try {
    const { firstName, lastName, phone, dob, email, password, confirmPassword } = await request.json();

    log(`Signup attempt for email: ${email}`, sessionId, { ip, userAgent });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nSignup Attempt.\nEmail : ${email}`);

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
      log(`Validation errors for email: ${email}`, sessionId, { errors });
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
      log(`Validation errors for email: ${email}`, sessionId, { errors });
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Check if email already exists
      const emailCheckResult = await client.query('SELECT email FROM users WHERE email = $1', [email]);
      if (emailCheckResult.rows.length > 0) {
        log(`Email already exists for email: ${email}`, sessionId);
        return NextResponse.json({ success: false, errors: { email: 'A user with that email already exists, please try with another email.' } }, { status: 400 });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      await client.query(
        'INSERT INTO users (first_name, last_name, phone, dob, email, password, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [firstName, lastName, phone, dob, email, hashedPassword, 'pending']
      );

      log(`User registered successfully for email: ${email}`, sessionId);
      await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nUser Registered Successfully.\nEmail : ${email}`);

      // Return success response
      return NextResponse.json({ success: true, message: 'User registered successfully.' }, { status: 200 });
    } catch (error) {
      log(`Database error during signup for email: ${email} - ${error.message}`, sessionId);
      await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nDatabase Error During User Signup.\nEmail : ${email} - ${error.message}`);
      return NextResponse.json({ success: false, errors: { general: 'Database error' } }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    log(`Request error during signup for email: ${email} - ${error.message}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-----------------------------------\nRequest Error During User Signup.\nEmail : ${email} - ${error.message}`);
    return NextResponse.json({ success: false, errors: { general: 'Invalid request' } }, { status: 400 });
  }
}
