// api/member_details/staff_member_details/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(req, context) {
  const { params } = context;
  const { id } = await params; // Await the params object

  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const apiCallMessage = formatAlertMessage('Staff Member Details - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching details for Staff Member', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Staff Member Details',
        details: `Fetching details for Staff Member ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Fetch Staff Member basic info
    const staffMemberBasicInfoQuery = `SELECT * FROM staff_member_basic_info WHERE id = $1;`;
    const staffMemberBasicInfoResult = await query(staffMemberBasicInfoQuery, [id]);
  
    // Fetch Staff Member education info
    const staffMemberEducationQuery = `SELECT * FROM staff_member_education_info WHERE staff_member_id = $1;`;
    const staffMemberEducationResult = await query(staffMemberEducationQuery, [id]);
  
    // Fetch Staff Member career info
    const staffMemberCareerQuery = `SELECT * FROM staff_member_career_info WHERE staff_member_id = $1;`;
    const staffMemberCareerResult = await query(staffMemberCareerQuery, [id]);

    // Fetch Staff Member social media info
    const staffMemberSocialMediaQuery = `SELECT * FROM staff_member_socialMedia_info WHERE staff_member_id = $1;`;
    const staffMemberSocialMediaResult = await query(staffMemberSocialMediaQuery, [id]);
  
    const staffMemberDetails = {
      basicInfo: staffMemberBasicInfoResult.rows[0],
      education: staffMemberEducationResult.rows,
      career: staffMemberCareerResult.rows,
      socialMedia: staffMemberSocialMediaResult.rows,
    };

    const successMessage = formatAlertMessage('Successfully Fetched Staff Member Details', `ID : ${id}`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched details for Staff Member', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Staff Member Details',
        details: `Successfully fetched details for Staff Member ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(staffMemberDetails, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Staff Member Details', `ID : ${id}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching Staff Member details', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Staff Member Details',
        details: `Error fetching details for Staff Member ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to fetch Staff Member details' }, { status: 500 });
  }
}