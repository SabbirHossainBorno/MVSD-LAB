// app/api/login/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, email, ipAddress, userAgent, additionalInfo = '') => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}${additionalInfo}`;
};

const updateLoginDetails = async (email) => {
  const now = new Date();
  await query(
    `UPDATE admin SET status = 'Active', last_login_time = $1, login_count = login_count + 1 WHERE email = $2`,
    [now, email]
  );
};

export async function POST(request) {
  const { email, password } = await request.json();
  const sessionId = uuidv4();

  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  //console.log(`Login attempt: email=${email}, ipAddress=${ipAddress}, userAgent=${userAgent}`);

  const loginAttemptMessage = formatAlertMessage('Login Attempt!', email, ipAddress, userAgent);
  await sendTelegramAlert(loginAttemptMessage);

  logger.info('Received login request', {
    meta: {
      eid: '',
      sid: sessionId,
      taskName: 'Login',
      details: `Login attempt for ${email} from IP ${ipAddress} with User-Agent ${userAgent}`
    }
  });

  try {
    const checkUser = async (table) => {
      logger.info(`Checking ${table} table for user`, {
        meta: {
          eid: '',
          sid: sessionId,
          taskName: 'Login',
          details: `Querying ${table} table for ${email}`
        }
      });

      //console.log(`Querying ${table} table for email=${email}`);

      const res = await query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2`, [email, password]);
      if (res.rows.length > 0) {
        const eid = `${Math.floor(Math.random() * 1000000)}-MVSDLAB`; // Generate an execution ID

        logger.info('Generated execution ID', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'Generate EID',
            details: `Generated EID ${eid} for user ${email}`
          }
        });

        //console.log(`Login successful: email=${email}, eid=${eid}`);

        const successMessage = formatAlertMessage(`${table === 'admin' ? 'Admin' : 'User'} Login Successful.`, email, ipAddress, userAgent, `\nEID : ${eid}`);
        await sendTelegramAlert(successMessage);

        logger.info('Login successful', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'Login',
            details: `User ${email} logged in successfully from IP ${ipAddress} with User-Agent ${userAgent}`
          }
        });

        await updateLoginDetails(email); // Update login details

        const response = NextResponse.json({ success: true, type: table === 'admin' ? 'admin' : 'user' });
        response.cookies.set('email', email, { httpOnly: true });
        response.cookies.set('sessionId', sessionId, { httpOnly: true });
        response.cookies.set('eid', eid, { httpOnly: true }); // Store EID in a cookie
        return response;
      }
      return null;
    };

    const adminResponse = await checkUser('admin');
    if (adminResponse) return adminResponse;

    const userResponse = await checkUser('users');
    if (userResponse) return userResponse;

    const failedMessage = formatAlertMessage('Login Failed!', email, ipAddress, userAgent);
    await sendTelegramAlert(failedMessage);

    logger.warn('Login failed', {
      meta: {
        eid: '',
        sid: sessionId,
        taskName: 'Login',
        details: `Failed login attempt for ${email} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    //console.log(`Login failed: email=${email}`);

    return NextResponse.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error During Login!', email, ipAddress, userAgent, `\nError: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error during login', {
      meta: {
        eid: '',
        sid: sessionId,
        taskName: 'Login',
        details: `Error during login for ${email}: ${error.message} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    console.error(`Error during login: email=${email}, error=${error.message}`);

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}