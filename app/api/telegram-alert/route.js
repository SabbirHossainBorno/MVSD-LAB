// app/api/telegram-alert/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID) {
  throw new Error('Missing Telegram environment variables');
}

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
    });
    console.log('Telegram alert sent successfully');
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    throw new Error('Failed to send Telegram alert');
  }
};

export async function POST(request) {
  const { message } = await request.json();

  try {
    await sendTelegramAlert(message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send Telegram alert' }, { status: 500 });
  }
}
