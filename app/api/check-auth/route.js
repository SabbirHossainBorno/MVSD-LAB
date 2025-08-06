// app/api/check-auth/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { query } from '../../../lib/db';

const formatAlertMessage = (title, email, ipAddress, additionalInfo = '') => {
  return `SOC PORTAL AUTH-CHECKER\n----------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}${additionalInfo}`;
};

// Security headers configuration
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=()'
};

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const eid = request.cookies.get('eid')?.value || '';
  const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';
  const email = request.cookies.get('email')?.value;
  const socPortalId = request.cookies.get('socPortalId')?.value;

  // Immediate response for missing credentials
  if (!email || !sessionId) {
    const alertMessage = `SOC PORTAL AUTH-CHECKER\n----------------------------------------\n🚨 Unauthorized Access Attempt!\nIP : ${ip}\nUA : ${userAgent}`;
    await sendTelegramAlert(alertMessage);

    logger.warn('Unauthorized access attempt', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: `IP: ${ip} | UA: ${userAgent}`,
        severity: 'HIGH'
      }
    });

    return NextResponse.json(
      { authenticated: false, message: 'Missing credentials' },
      { status: 401, headers: securityHeaders }
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.toLowerCase())) {
    logger.warn('Invalid email format', {
      meta: {
        email,
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: `Invalid email format: ${email}`,
        severity: 'MEDIUM'
      }
    });

    return NextResponse.json(
      { authenticated: false, message: 'Invalid email format' },
      { status: 400, headers: securityHeaders }
    );
  }

  try {
    // Session expiration check
    const lastActivity = request.cookies.get('lastActivity')?.value;
    const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    
    if (lastActivity) {
      const now = new Date();
      const lastActivityDate = new Date(lastActivity);
      const diff = now - lastActivityDate;

      if (diff > SESSION_TIMEOUT) {
        const alertMessage = formatAlertMessage('🔐 Session Expired', email, ip);
        await sendTelegramAlert(alertMessage);

        logger.info('Session expired', {
          meta: {
            email,
            eid,
            sid: sessionId,
            taskName: 'Auth Check',
            details: `Last activity: ${lastActivity}`,
            severity: 'MEDIUM'
          }
        });

        const response = NextResponse.json(
          { authenticated: false, message: 'Session expired' },
          { status: 401, headers: securityHeaders }
        );
        
        // Clear authentication cookies
        response.cookies.delete('sessionId');
        response.cookies.delete('email');
        response.cookies.delete('socPortalId');
        return response;
      }
    }

    // Role verification
    let roleType = null;
    let userType = null;

    // Check admin_info table
    const adminRes = await query(
      `SELECT status, role_type 
       FROM admin_info 
       WHERE email = $1`,
      [email]
    );
    
    if (adminRes.rows.length > 0) {
      const admin = adminRes.rows[0];
      
      if (admin.status !== 'Active') {
        logger.warn('Inactive admin login attempt', {
          meta: {
            email,
            eid,
            sid: sessionId,
            taskName: 'Auth Check',
            details: 'Admin account not active',
            severity: 'HIGH'
          }
        });
        return NextResponse.json(
          { authenticated: false, message: 'Account inactive' },
          { status: 403, headers: securityHeaders }
        );
      }
      
      roleType = admin.role_type;
      userType = 'admin';
    } 
    // If not found in admin_info, check user_info
    else {
      const userRes = await query(
        `SELECT status, role_type 
         FROM user_info 
         WHERE email = $1`,
        [email]
      );
      
      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        
        if (user.status !== 'Active') {
          logger.warn('Inactive user login attempt', {
            meta: {
              email,
              eid,
              sid: sessionId,
              taskName: 'Auth Check',
              details: 'User account not active',
              severity: 'HIGH'
            }
          });
          return NextResponse.json(
            { authenticated: false, message: 'Account inactive' },
            { status: 403, headers: securityHeaders }
          );
        }
        
        roleType = user.role_type;
        userType = 'user';
      }
    }

    if (!roleType) {
      logger.warn('No valid user found', {
        meta: {
          email,
          eid,
          sid: sessionId,
          taskName: 'Auth Check',
          details: 'No matching active account found',
          severity: 'MEDIUM'
        }
      });
      return NextResponse.json(
        { authenticated: false, message: 'Account not found' },
        { status: 404, headers: securityHeaders }
      );
    }

    // Verify socPortalId if present
    if (socPortalId) {
      let isValidId = false;
      
      if (userType === 'admin') {
        const idCheck = await query(
          `SELECT 1 FROM admin_info 
           WHERE email = $1 AND soc_portal_id = $2`,
          [email, socPortalId]
        );
        isValidId = idCheck.rows.length > 0;
      } else {
        const idCheck = await query(
          `SELECT 1 FROM user_info 
           WHERE email = $1 AND soc_portal_id = $2`,
          [email, socPortalId]
        );
        isValidId = idCheck.rows.length > 0;
      }
      
      if (!isValidId) {
        logger.warn('Invalid SOC Portal ID', {
          meta: {
            email,
            socPortalId,
            eid,
            sid: sessionId,
            taskName: 'Auth Check',
            details: 'Provided ID does not match account',
            severity: 'HIGH'
          }
        });
        return NextResponse.json(
          { authenticated: false, message: 'Invalid credentials' },
          { status: 403, headers: securityHeaders }
        );
      }
    }

    logger.info('Authentication successful', {
      meta: {
        email,
        socPortalId,
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: `Role type: ${roleType} (${userType})`,
        severity: 'LOW'
      }
    });

    return NextResponse.json(
      { 
        authenticated: true, 
        role: roleType,
        userType: userType,
        socPortalId: socPortalId || 'Unknown'
      },
      { headers: securityHeaders }
    );

  } catch (error) {
    console.error('Authentication check error:', error);

    const alertMessage = formatAlertMessage(
      '❌ Auth Check Error',
      email,
      ip,
      `\nError: ${error.message}`
    );
    await sendTelegramAlert(alertMessage);

    logger.error('Authentication check failed', {
      meta: {
        email,
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: error.stack,
        severity: 'CRITICAL'
      }
    });

    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}