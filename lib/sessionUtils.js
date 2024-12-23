// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';

export const handleSessionExpiration = async (router) => {
  const email = Cookies.get('email');
  const sessionId = Cookies.get('sessionId');
  Cookies.remove('email');
  Cookies.remove('sessionId');
  
  toast.error('Session Expired! Please Login Again.');
  
  await axios.post('/api/log-and-alert', {
    message: 'MVSD LAB DASHBOARD\n------------------------------------\nSession Expired!\nPlease Login Again.',
    sessionId,
    details: { email }
  });

  router.push('/login?sessionExpired=true');
};