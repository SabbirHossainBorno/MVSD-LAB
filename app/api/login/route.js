// app/api/login/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (userType, email, ipAddress, userAgent, additionalInfo = {}) => {
  const isAdmin = userType === 'admin';
  let message = isAdmin 
    ? "MVSD LAB DASHBOARD\n------------------------------------\nAdmin Login Successful.\n"
    : "MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\nMember Login Successful.\n";
  message += `Email : ${email}\n`;
  
  if (!isAdmin && additionalInfo.memberId) {
    message += `ID : ${additionalInfo.memberId}\n`;
  }
  message += `IP : ${ipAddress}\nDevice INFO : ${userAgent}\nEID : ${additionalInfo.eid || 'N/A'}`;
  
  return message;
};

const updateLoginDetails = async (email) => {
  const now = new Date();
  await query(
    `UPDATE admin SET status = 'Active', last_login_time = $1, login_count = login_count + 1 WHERE email = $2`,
    [now, email]
  );
};

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
    // Propagate the error to prevent login success
    throw error;
  }
};

export async function POST(request) {
  const { email, password } = await request.json();
  const sessionId = uuidv4();
  const isAdminEmail = email.endsWith('@mvsdlab.com');
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  // Login attempt alert
  const attemptMessage = formatAlertMessage(
    isAdminEmail ? 'admin' : 'member',
    email,
    ipAddress,
    userAgent,
    { eid: 'Login Attempt' }
  ).replace('Successful', 'Attempt');
  await sendTelegramAlert(attemptMessage);
  logger.info('Received login request', {
    meta: {
      eid: '',
      sid: sessionId,
      taskName: 'Login',
      details: `Login attempt for ${email} from IP ${ipAddress}`,
      userType: isAdminEmail ? 'admin' : 'member'
    }
  });

  try {
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
        
        // Password validation
        const passwordValid = comparePassword 
          ? await bcrypt.compare(password, user.password)
          : password === user.password;
        
        if (!passwordValid) {
          logger.warn('Password mismatch', {
            meta: {
              sid: sessionId,
              taskName: 'AuthCheck',
              details: `Invalid password for ${email}`,
              userType: table
            }
          });
          return null;
        }
        // Member status check
        if (table === 'member' && user.status !== 'Active') {
          logger.warn('Inactive member login attempt', {
            meta: {
              sid: sessionId,
              taskName: 'AuthCheck',
              details: `Inactive member ${email} blocked`,
              userType: 'member'
            }
          });
          
          // Send Telegram alert
          const inactiveMessage = formatAlertMessage(
            'member',
            email,
            ipAddress,
            userAgent,
            { eid: 'Inactive Login Attempt' }
          ).replace('Successful', 'Failed (Inactive Member)');
          
          await sendTelegramAlert(inactiveMessage);
          
          return NextResponse.json({ 
            success: false, 
            message: 'Sorry You Are Not Active Member! Please Contact Administration' 
          });
        }
        const eid = `${Math.floor(100000 + Math.random() * 900000)}-MVSDLAB`;
        logger.info('Generated execution ID', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'Generate EID',
            details: `Generated EID ${eid} for user ${email}`
          }
        });
        // Update member tracker
        if (table === 'member') {
          await updateMemberLoginTracker(user.id, email);
        }
        // Success alert
        const successMessage = formatAlertMessage(
          table,
          email,
          ipAddress,
          userAgent,
          {
            eid,
            memberId: table === 'member' ? user.id : undefined
          }
        );
        await sendTelegramAlert(successMessage);
        logger.info('Login success', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'AuthSuccess',
            details: `Successful ${table} login for ${email}`,
            userType: table,
            userId: table === 'member' ? user.id : 'admin'
          }
        });
        // Update admin details
        if (table === 'admin') {
          await updateLoginDetails(email);
        }
        // Set response cookies
const response = NextResponse.json({ 
  success: true, 
  type: table === 'admin' ? 'admin' : 'user' 
});

const cookieConfig = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };
response.cookies.set('email', email, cookieConfig);
response.cookies.set('sessionId', sessionId, cookieConfig);
response.cookies.set('eid', eid, cookieConfig);
// Set non-httpOnly cookies for client-side access
response.cookies.set('id', user.id, { 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax'
});

response.cookies.set('type', user.type, { // 'Professor' or 'PhD Candidate'
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax'
});

console.log('Setting memberId cookie:', user.id); // Debugging log
console.log('Setting memberType cookie:', user.type); // Debugging log
response.cookies.set('redirect', 
  table === 'admin' ? '/dashboard' :
  ['Professor', 'PhD Candidate'].includes(user.type) ? '/member_dashboard' : '/home',
  cookieConfig
);
return response;
      }
      return null;
    };

    // Check admin first if email matches
    if (isAdminEmail) {
      const adminResponse = await checkUser('admin', false);
      if (adminResponse) return adminResponse;
    }
    // Check member if not admin
    const memberResponse = await checkUser('member', true);
    if (memberResponse) return memberResponse;

    // Failed login handling
    const failedMessage = formatAlertMessage(
      isAdminEmail ? 'admin' : 'member',
      email,
      ipAddress,
      userAgent,
      { eid: 'Failed Attempt' }
    ).replace('Successful', 'Failed');
    await sendTelegramAlert(failedMessage);
    logger.warn('Login failed', {
      meta: {
        sid: sessionId,
        taskName: 'AuthFailure',
        details: `Failed login for ${email}`,
        userType: isAdminEmail ? 'admin' : 'member'
      }
    });
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid email or password' 
    });
  } catch (error) {
    // Error handling
    const errorMessage = formatAlertMessage(
      isAdminEmail ? 'admin' : 'member',
      email,
      ipAddress,
      userAgent,
      { eid: 'Error', error: error.message }
    ).replace('Successful', 'Error');
    await sendTelegramAlert(errorMessage);
    logger.error('Login process error', {
      meta: {
        sid: sessionId,
        taskName: 'SystemError',
        details: `Error: ${error.message}`,
        userType: isAdminEmail ? 'admin' : 'member'
      }
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}