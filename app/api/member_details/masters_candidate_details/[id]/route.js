// api/member_details/masters_candidate_details/[id]/route.js
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
    const apiCallMessage = formatAlertMessage("Master's Candidate Details - API", `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info("Fetching details for Master's candidate", {
      meta: {
        eid,
        sid: sessionId,
        taskName: "Fetch Master's Candidate Details",
        details: `Fetching details for Master's candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Fetch Master's candidate basic info
    const mastersCandidateBasicInfoQuery = `SELECT * FROM masters_candidate_basic_info WHERE id = $1;`;
    const mastersCandidateBasicInfoResult = await query(mastersCandidateBasicInfoQuery, [id]);
  
    // Fetch Master's candidate education info
    const mastersCandidateEducationQuery = `SELECT * FROM masters_candidate_education_info WHERE masters_candidate_id = $1;`;
    const mastersCandidateEducationResult = await query(mastersCandidateEducationQuery, [id]);
  
    // Fetch Master's candidate career info
    const mastersCandidateCareerQuery = `SELECT * FROM masters_candidate_career_info WHERE masters_candidate_id = $1;`;
    const mastersCandidateCareerResult = await query(mastersCandidateCareerQuery, [id]);

    // Fetch Master's candidate social media info
    const mastersCandidateSocialMediaQuery = `SELECT * FROM masters_candidate_socialMedia_info WHERE masters_candidate_id = $1;`;
    const mastersCandidateSocialMediaResult = await query(mastersCandidateSocialMediaQuery, [id]);
  
    const mastersCandidateDetails = {
      basicInfo: mastersCandidateBasicInfoResult.rows[0],
      education: mastersCandidateEducationResult.rows,
      career: mastersCandidateCareerResult.rows,
      socialMedia: mastersCandidateSocialMediaResult.rows,
    };

    const successMessage = formatAlertMessage("Successfully Fetched Master's Candidate Details", `ID : ${id}`);
    await sendTelegramAlert(successMessage);

    logger.info("Successfully fetched details for Master's Candidate", {
      meta: {
        eid,
        sid: sessionId,
        taskName: "Fetch Master's Candidate Details",
        details: `Successfully fetched details for Master's Candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(mastersCandidateDetails, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage("Error Fetching Master's Candidate Details", `ID : ${id}`);
    await sendTelegramAlert(errorMessage);

    logger.error("Error fetching Master's candidate details", {
      meta: {
        eid,
        sid: sessionId,
        taskName: "Fetch Master's Candidate Details",
        details: `Error fetching details for Master's candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: "Failed to fetch Master's candidate details" }, { status: 500 });
  }
}