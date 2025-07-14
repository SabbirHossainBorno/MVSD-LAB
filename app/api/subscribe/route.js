// app/api/subscribe/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import nodemailer from 'nodemailer';

const formatAlertMessage = (title, details) => {
  return `📢 *MVSD LAB HOME ALERT*\n━━━━━━━━━━━━━━━━━━\n*${title}*\n${details}`;
};

const generateSubscriberId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM subscriber');
    const maxId = result.rows[0]?.max_id || 'SUB00MVSD';
    const numericPart = parseInt(maxId.substring(3, 5), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `SUB${String(nextId).padStart(2, '0')}MVSD`;
    return formattedId;
  } catch (error) {
    logger.error('Subscriber ID generation failed', {
      meta: {
        taskName: 'Home - Subscribe',
        details: `Database error while generating subscriber ID: ${error.message}`
      }
    });
    throw new Error(`Error generating Subscriber ID: ${error.message}`);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { email } = await request.json();

    // Validate email format
    if (!email || !validateEmail(email)) {
      const message = 'Please enter a valid email address';

      await sendTelegramAlert(formatAlertMessage('🚫 Invalid Email Attempt', `🔹 IP: ${ipAddress}\n🔹 User Agent: ${userAgent}\n🔹 Email: ${email}`));
      logger.warn('Email validation failed', {
        meta: {
          taskName: 'Home - Subscribe',
          details: `Invalid email format attempted from IP: ${ipAddress}, Email: ${email}`
        }
      });

      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    // Check for existing email
    const checkResult = await query('SELECT email FROM subscriber WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) {
      const userMessage = 'You are already a subscriber.';

      await sendTelegramAlert(formatAlertMessage('🔁 Duplicate Subscription Attempt', `🔹 Email: ${email}\n🔹 IP: ${ipAddress}`));

      logger.info('Duplicate subscription attempt', {
        meta: {
          taskName: 'Home - Subscribe',
          details: `Existing subscriber tried to re-subscribe from IP: ${ipAddress}, Email: ${email}`
        }
      });

      return NextResponse.json({ success: false, message: userMessage }, { status: 400 });
    }

    // Generate new subscriber ID
    const subscriberId = await generateSubscriberId();

    // Insert subscriber into database
    const result = await query(
      'INSERT INTO subscriber (id, email, date) VALUES ($1, $2, NOW()) RETURNING serial',
      [subscriberId, email]
    );
    const { serial } = result.rows[0];

    logger.info('Subscriber added to database', {
      meta: {
        taskName: 'Home - Subscribe',
        details: `New subscriber added: ${subscriberId}, Email: ${email}, IP: ${ipAddress}`
      }
    });

    // Send confirmation email
    let emailSent = false;
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0c0c1d, #121230); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">Welcome to MVSD LAB</h1>
            <p>You're now part of our exclusive community</p>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b;">Subscription Confirmed!</h2>
            <p>Thank you for subscribing to MVSD LAB updates.</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Subscriber ID:</strong> ${subscriberId}</p>
            </div>
            <p>We'll notify you about our innovations in automotive engineering and AI research.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://www.mvsdlab.com" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visit Our Website</a>
            </div>
          </div>
          <div style="padding: 20px; background-color: #f1f5f9; text-align: center; color: #64748b; font-size: 14px;">
            <p>© ${new Date().getFullYear()} MVSD LAB. All rights reserved.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"MVSD LAB" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: `Subscription Confirmed - Welcome to MVSD LAB`,
        html: emailContent
      });

      emailSent = true;
      logger.info('Confirmation email sent', {
        meta: {
          taskName: 'Home - Subscribe',
          details: `Email sent successfully to ${email}`
        }
      });
    } catch (emailError) {
      logger.error('Email sending failed', {
        meta: {
          taskName: 'Home - Subscribe',
          details: `Failed to send email to ${email}. Error: ${emailError.message}`
        }
      });
    }

    // Send admin notification
    const notificationTitle = `MVSD LAB Got New Subscriber [${subscriberId}]`;
    const notificationStatus = 'Unread';
    await query('INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3)', [subscriberId, notificationTitle, notificationStatus]);

    await sendTelegramAlert(formatAlertMessage('🎉 New Subscriber', `🆔 ID: ${subscriberId}\n📧 Email: ${email}\n📨 Email Sent: ${emailSent ? '✅ Yes' : '❌ No'}`));

    logger.info('Admin alerted via Telegram', {
      meta: {
        taskName: 'Home - Subscribe',
        details: `Telegram alert sent for new subscriber ${subscriberId}`
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: emailSent 
        ? 'Subscription Successful! Confirmation Email Sent.' 
        : 'Subscription successful! But we encountered an issue sending your confirmation email.',
      serial 
    });
  } catch (error) {
    const errorMessage = `Server error: ${error.message}`;
    await sendTelegramAlert(formatAlertMessage('❗ Subscription Error', `🔹 IP: ${ipAddress}\n❌ Error: ${errorMessage}`));
    logger.error('Unexpected server error', {
      meta: {
        taskName: 'Home - Subscribe',
        details: `Unhandled exception: ${error.message}, IP: ${ipAddress}`
      }
    });

    return NextResponse.json({ success: false, message: 'Server error. Please try again later.' }, { status: 500 });
  }
}
