// app/api/member_dashboard/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger'; // Import the logger
import sendTelegramAlert from '../../../lib/telegramAlert'; // Import the Telegram alert function

const formatAlertMessage = (title, email, ipAddress, userAgent, additionalInfo = '') => {
  return `MVSD LAB MEMBER DASHBOARD\n-----------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}${additionalInfo}`;
};

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value || '';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  try {
    const email = request.cookies.get('email')?.value;
    
    if (!email) {
      logger.warn('Unauthorized dashboard access', {
        meta: {
          sid: sessionId,
          taskName: 'DashboardAuth',
          details: 'Missing email cookie'
        }
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, first_name, last_name, email, photo, type, 
       status, created_at, updated_at FROM member WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      logger.error('Member not found', {
        meta: {
          sid: sessionId,
          taskName: 'DashboardData',
          details: `Email: ${email}`
        }
      });
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const memberData = result.rows[0];
    
    logger.info('Member data retrieved', {
      meta: {
        sid: sessionId,
        taskName: 'DashboardData',
        details: `Fetched data for ${email}`
      }
    });

    sendTelegramAlert(formatAlertMessage(
      'Dashboard Data Fetched',
      email,
      ipAddress,
      userAgent,
      `\nMemberID : ${memberData.id}`
    ));

    return NextResponse.json({
      ...memberData,
      eid: `${Math.floor(100000 + Math.random() * 900000)}-MVSDLAB`,
      ipAddress,
      userAgent
    });

  } catch (error) {
    logger.error('Dashboard API error', {
      meta: {
        sid: sessionId,
        taskName: 'DashboardAPI',
        details: error.message
      }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}