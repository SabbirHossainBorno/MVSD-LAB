// app/api/send_bulk_email/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import nodemailer from 'nodemailer';

const formatAlertMessage = (title, details) => {
  return `📢 *MVSD LAB BULK EMAIL*\n━━━━━━━━━━━━━━\n*${title}*\n${details}`;
};

export async function POST(request) {
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { subject, cc, body } = await request.json();

    // Get all subscribers
    const result = await query('SELECT email FROM subscriber');
    const emails = result.rows.map(row => row.email);
    
    if (emails.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No subscribers found' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare email options
    const mailOptions = {
      from: `"MVSD LAB" <${process.env.EMAIL_FROM}>`,
      to: emails.join(','),
      subject: subject,
      html: body,
    };

    // Add CC if provided
    if (cc) {
      mailOptions.cc = cc;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log success
    logger.info('Bulk email sent successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Send Bulk Email',
        details: `Sent to ${emails.length} subscribers. Subject: ${subject}`
      }
    });

    // Send Telegram alert
    await sendTelegramAlert(formatAlertMessage(
      '📧 Bulk Email Sent',
      `🔹 Subject: ${subject}\n🔹 Recipients: ${emails.length}\n🔹 CC: ${cc || 'None'}`
    ));

    return NextResponse.json({ 
      success: true, 
      message: `Email sent to ${emails.length} subscribers` 
    });
    
  } catch (error) {
    logger.error('Bulk email failed', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Send Bulk Email',
        details: `Error: ${error.message}`
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      '❌ Bulk Email Failed',
      `🔹 IP: ${ipAddress}\n🔹 Error: ${error.message}`
    ));

    return NextResponse.json(
      { success: false, message: 'Failed to send bulk email' }, 
      { status: 500 }
    );
  }
}