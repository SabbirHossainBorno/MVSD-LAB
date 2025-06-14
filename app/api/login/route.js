// app/api/login/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { DateTime } from 'luxon';

// Get current time in America/New_York (EDT/EST)
const getCurrentDateTime = () => {
  return DateTime.now().setZone('America/New_York').toFormat('yyyy-LL-dd HH:mm:ss');
};

// Format Telegram alert message
const formatAlertMessage = (userType, email, ipAddress, userAgent, additionalInfo = {}) => {
  let title = '';
  let idLine = ''; // For director or member IDs
  const eid = additionalInfo.eid || 'N/A';
  const status = additionalInfo.status || 'Successful';
  const time = getCurrentDateTime();

  switch (userType.toLowerCase()) {
    case 'admin':
      title = '🔐 MVSD LAB ADMIN LOGIN 🔐';
      break;

    case 'director':
      title = '🔐 MVSD DIRECTOR LOGIN 🔐';
      idLine = `Director ID : ${additionalInfo.memberId || 'N/A'}\n`;
      break;

    default:
      title = '🔐 MVSD MEMBER LOGIN 🔐';
      idLine = `Member ID  : ${additionalInfo.memberId || 'N/A'}\n`;
  }

  const message = `${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Email       : ${email}
${idLine}IP Address  : ${ipAddress}
Device Info : ${userAgent}
EID         : ${eid}
Time        : ${time}
Status      : ${status}`;

  return `\`\`\`\n${message}\n\`\`\``; // Telegram code block
};

// Update admin login details in DB
const updateLoginDetails = async (email) => {
  const now = new Date();
  await query(
    `UPDATE admin SET status = 'Active', last_login_time = $1, login_count = login_count + 1 WHERE email = $2`,
    [now, email]
  );
};

// Update member login tracker in DB
const updateMemberLoginTracker = async (userId, email) => {
  try {
    await query(
      `INSERT INTO member_login_info_tracker 
       (id, email, last_login_time, last_login_date, total_login_count, login_state)
       VALUES ($1, $2, NOW(), NOW()::date, 1, 'Active')
       ON CONFLICT (id) DO UPDATE SET
       last_login_time = NOW(),
       last_login_date = NOW()::date,
       total_login_count = member_login_info_tracker.total_login_count + 1,
       login_state = 'Active'`,
      [userId, email]
    );
  } catch (error) {
    logger.error('Member login tracker update failed', {
      meta: {
        taskName: 'LoginTracking',
        details: `Error updating tracker for ${email}: ${error.message}`
      }
    });
    throw error;
  }
};

// Update director login tracker in DB
const updateDirectorLoginTracker = async (userId, email) => {
  try {
    await query(
      `INSERT INTO director_login_info_tracker 
       (id, email, last_login_time, last_login_date, total_login_count, login_state)
       VALUES ($1, $2, NOW(), NOW()::date, 1, 'Active')
       ON CONFLICT (id) DO UPDATE SET
         last_login_time = EXCLUDED.last_login_time,
         last_login_date = EXCLUDED.last_login_date,
         total_login_count = director_login_info_tracker.total_login_count + 1,
         login_state = 'Active'`,
      [userId, email]
    );
  } catch (error) {
    logger.error('Director login tracker update failed', {
      meta: {
        taskName: 'LoginTracking',
        details: `Error updating tracker for ${email}: ${error.message}`
      }
    });
    throw error;
  }
};

// Create login success response + alert + cookie setup
const createLoginResponse = async (user, userType, table, sessionId, email, ipAddress, userAgent) => {
  const eid = `${Math.floor(100000 + Math.random() * 900000)}-MVSDLAB`;

  // Log director-specific details
  if (userType === 'director') {
    logger.info('Director login detected', {
      meta: {
        sid: sessionId,
        taskName: 'DirectorLogin',
        details: `Director ID: ${user.id}, Email: ${email}`
      }
    });
  }

  logger.info('Generated execution ID', {
    meta: {
      eid,
      sid: sessionId,
      taskName: 'Generate EID',
      details: `Generated EID ${eid} for ${userType} ${email}`
    }
  });

  // Update tracker DB tables based on user type
  if (table === 'member') {
    if (userType === 'director') {
      await updateDirectorLoginTracker(user.id, email);
    } else {
      await updateMemberLoginTracker(user.id, email);
    }
  }

  // Compose success message with EID and send Telegram alert
  const successMessage = formatAlertMessage(
    userType,
    email,
    ipAddress,
    userAgent,
    {
      eid,
      memberId: user.id,
      status: 'Successful'
    }
  );

  await sendTelegramAlert(successMessage);

  logger.info('Login success', {
    meta: {
      eid,
      sid: sessionId,
      taskName: 'AuthSuccess',
      details: `Successful ${userType} login for ${email}`,
      userType: userType,
      userId: user.id
    }
  });

  // Update admin last login details
  if (table === 'admin') {
    await updateLoginDetails(email);
  }

  // Prepare NextResponse with cookies
  const response = NextResponse.json({
    success: true,
    type: userType
  });

  const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  };

  // Set HTTP-only cookies for security
  response.cookies.set('email', email, cookieConfig);
  response.cookies.set('sessionId', sessionId, cookieConfig);
  response.cookies.set('eid', eid, cookieConfig);

  // Set non-HTTP-only cookies for client-side access
  response.cookies.set('id', user.id, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });

  response.cookies.set('type', user.type, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });

  // Redirect path based on user type
  let redirectPath = '/home';
  if (userType === 'admin') {
    redirectPath = '/dashboard';
  } else if (userType === 'director') {
    redirectPath = '/director_dashboard';
  } else if (['PhD Candidate', 'Professor'].includes(user.type)) {
    redirectPath = '/member_dashboard';
  }

  response.cookies.set('redirect', redirectPath, cookieConfig);

  return response;
};

export async function POST(request) {
  const { email, password } = await request.json();
  const sessionId = uuidv4();
  const isAdminEmail = email.endsWith('@mvsdlab.com');
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  // Initial userType guess for alert purposes
  let attemptUserType = isAdminEmail ? 'admin' : 'member';

  // Alert for login attempt
  const attemptMessage = formatAlertMessage(
    attemptUserType,
    email,
    ipAddress,
    userAgent,
    { eid: 'Login Attempt', status: 'Attempt' }
  );

  await sendTelegramAlert(attemptMessage);

  logger.info('Received login request', {
    meta: {
      eid: '',
      sid: sessionId,
      taskName: 'Login',
      details: `Login attempt for ${email} from IP ${ipAddress}`,
      userType: attemptUserType
    }
  });

  try {
    // Function to check user credentials and handle login logic
    const checkUser = async (table, comparePassword) => {
      logger.info(`Checking ${table} table`, {
        meta: {
          sid: sessionId,
          taskName: 'DBCheck',
          details: `Looking for ${email} in ${table}`,
          userType: table
        }
      });

      const res = await query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
      if (res.rows.length > 0) {
        const user = res.rows[0];

        // Director specific logging in member table
        if (table === 'member' && user.type === 'Director') {
          logger.info('Director login detected in member table', {
            meta: {
              sid: sessionId,
              taskName: 'DirectorCheck',
              details: `Found director: ${user.id}`
            }
          });
        }

        // Password check
        let passwordValid;
        if (table === 'member' && user.type === 'Director') {
          logger.info('Checking director_basic_info for password validation', {
            meta: {
              sid: sessionId,
              taskName: 'DirectorAuth',
              details: `Validating director ${user.id}`
            }
          });

          const directorRes = await query(
            `SELECT * FROM director_basic_info WHERE email = $1`,
            [email]
          );

          if (directorRes.rows.length === 0) {
            logger.warn('Director not found in director_basic_info', {
              meta: {
                sid: sessionId,
                email,
                userId: user.id
              }
            });
            return null;
          }

          const director = directorRes.rows[0];
          passwordValid = await bcrypt.compare(password, director.password);
        } else {
          passwordValid = comparePassword
            ? await bcrypt.compare(password, user.password)
            : password === user.password;
        }

        if (!passwordValid) {
          logger.warn('Password mismatch', {
            meta: {
              sid: sessionId,
              taskName: 'AuthCheck',
              details: `Invalid password for ${email}`,
              userType: table,
              userId: user.id
            }
          });
          return null;
        }

        // Director login successful - create response
        if (table === 'member' && user.type === 'Director') {
          return createLoginResponse(
            user,
            'director',
            table,
            sessionId,
            email,
            ipAddress,
            userAgent
          );
        }

        // Check if member active
        if (table === 'member' && user.status !== 'Active') {
          logger.warn('Inactive member login attempt', {
            meta: {
              sid: sessionId,
              taskName: 'AuthCheck',
              details: `Inactive member ${email} blocked`,
              userType: 'member',
              userId: user.id
            }
          });

          const inactiveMessage = formatAlertMessage(
            'member',
            email,
            ipAddress,
            userAgent,
            { eid: 'Inactive Login Attempt', status: 'Failed (Inactive Member)' }
          );

          await sendTelegramAlert(inactiveMessage);

          return NextResponse.json({
            success: false,
            message: 'Sorry You Are Not Active Member! Please Contact Administration'
          });
        }

        // Normal user/admin login success
        return createLoginResponse(
          user,
          table === 'admin' ? 'admin' : 'user',
          table,
          sessionId,
          email,
          ipAddress,
          userAgent
        );
      }
      return null;
    };

    // If admin email, check admin first
    if (isAdminEmail) {
      const adminResponse = await checkUser('admin', false);
      if (adminResponse) return adminResponse;
    }

    // Check member table for login
    const memberResponse = await checkUser('member', true);
    if (memberResponse) return memberResponse;

    // Login failed alert
    const failedMessage = formatAlertMessage(
      attemptUserType,
      email,
      ipAddress,
      userAgent,
      { eid: 'Failed Attempt', status: 'Failed' }
    );

    await sendTelegramAlert(failedMessage);

    logger.warn('Login failed', {
      meta: {
        sid: sessionId,
        taskName: 'AuthFailure',
        details: `Failed login for ${email}`,
        userType: attemptUserType
      }
    });

    return NextResponse.json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    // Error handling alert
    const errorMessage = formatAlertMessage(
      attemptUserType,
      email,
      ipAddress,
      userAgent,
      { eid: 'Error', error: error.message, status: 'Error' }
    );

    await sendTelegramAlert(errorMessage);

    logger.error('Login process error', {
      meta: {
        sid: sessionId,
        taskName: 'SystemError',
        details: `Error: ${error.message}`,
        userType: attemptUserType,
        stack: error.stack
      }
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message
      },
      { status: 500 }
    );
  }
}
