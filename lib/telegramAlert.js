import axios from 'axios';
import logger from './logger'; // Assuming you have a logger module

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID) {
  throw new Error('Telegram bot token and chat ID must be set in environment variables');
}

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    logger.info('Telegram alert sent successfully', { message });
  } catch (error) {
    logger.error('Failed to send Telegram alert', { error: error.message });
    console.error('Failed to send Telegram alert:', error);
  }
};

export default sendTelegramAlert;   