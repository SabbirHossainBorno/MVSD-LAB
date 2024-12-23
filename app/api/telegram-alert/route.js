// app/api/telegram-alert/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { log } from '../log-write/route';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID) {
  throw new Error('Missing necessary environment variables');
}

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
    });
    log('Telegram alert sent successfully', 'SYSTEM', 'SYSTEM', 'SUCCESS', 'SendTelegramAlert', { message });
  } catch (error) {
    log('Failed to send Telegram alert', 'SYSTEM', 'SYSTEM', 'ERROR', 'SendTelegramAlert', { error: error.message });
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