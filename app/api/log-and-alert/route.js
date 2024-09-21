// app/api/log-and-alert/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log');

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID || !process.env.DATABASE_URL) {
  throw new Error('Missing necessary environment variables');
}

const log = (message, sessionId, details = {}) => {
  const timeZone = 'Asia/Dhaka'; // Set your server's time zone
  const zonedDate = utcToZonedTime(new Date(), timeZone);
  const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });

  const logMessage = `${formattedDate} [Session ID: ${sessionId}] ${message} ${JSON.stringify(details)}\n`;
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
  try {
    const { message, sessionId, details } = await request.json();
    log(message, sessionId, details);
    await sendTelegramAlert(message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in log-and-alert API:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  }
}
