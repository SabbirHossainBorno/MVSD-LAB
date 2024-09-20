import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { NextResponse } from 'next/server';

const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log');
const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

// Log function
const log = (message, sessionId) => {
  const logMessage = `${new Date().toISOString()} [Session ID: ${sessionId}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

// Send Telegram alert function
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

// Export POST method for handling logout
export async function POST(req) {
  try {
    // Retrieve cookies from the request
    const email = req.cookies.get('email')?.value;
    const sessionId = req.cookies.get('sessionId')?.value;
    const ipAddress = req.headers.get('x-forwarded-for') || req.connection.remoteAddress;

    // Log the logout event
    log(`User ${email} logged out successfully.`, sessionId);

    // Send the Telegram alert
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nLogged Out Successfully!\Email : ${email}\nIP : ${ipAddress}`);

    // Clear cookies
    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.set('email', '', { maxAge: 0 });
    response.cookies.set('sessionId', '', { maxAge: 0 });
    response.cookies.set('lastActivity', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
