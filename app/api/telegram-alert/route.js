// app/api/telegram-alert/route.js
import axios from 'axios';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

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
  }
};

export { sendTelegramAlert };
