// app/api/telegram-alert/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { query } from '../../../lib/db';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID) {
  throw new Error('Missing necessary environment variables');
}

const logWrite = async (message, eid, sid, status, taskName, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-write`, { message, eid, sid, status, taskName, details });
  } catch (error) {
    console.error('Failed to write log:', error);
  }
};

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
    });
    await logWrite('Telegram alert sent successfully', 'SYSTEM', 'SYSTEM', 'SUCCESS', 'SendTelegramAlert', { message });
  } catch (error) {
    await logWrite('Failed to send Telegram alert', 'SYSTEM', 'SYSTEM', 'ERROR', 'SendTelegramAlert', { error: error.message });
    console.error('Failed to send Telegram alert:', error);
  }
};

export async function POST(request) {
  try {
    const { message } = await request.json();
    await sendTelegramAlert(message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in telegram-alert API:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  }
}