// app/api/member_dashboard/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, email, ipAddress, userAgent, additionalInfo = '') => {
  return `MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}${additionalInfo}`;
};

export async function GET(request) {
  const cookies = {
    sessionId: request.cookies.get('sessionId')?.value,
    email: request.cookies.get('email')?.value,
    eid: request.cookies.get('eid')?.value
  };

  console.log('🔑 Received cookies:', cookies);
  
  try {
    if (!cookies.email || !cookies.eid) {
      console.warn('🚫 Missing authentication cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Querying database for:', cookies.email);
    const result = await query(
      `SELECT id, first_name, last_name, email, photo, type, 
       status, created_at, updated_at FROM member WHERE email = $1`,
      [cookies.email]
    );

    console.log('📊 Database results:', result.rows);

    if (result.rows.length === 0) {
      console.warn('❌ Member not found for email:', cookies.email);
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    console.log('✅ Member found:', result.rows[0].email);
    return NextResponse.json({
      ...result.rows[0],
      eid: cookies.eid,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    });

  } catch (error) {
    console.error('🔥 API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}