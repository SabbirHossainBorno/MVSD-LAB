import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n${title}\n${details}`;
};

const typeCodes = {
  'International Journal': 'INT_JOURNAL',
  'Domestic Journal': 'DOM_JOURNAL',
  'International Conference': 'INT_CONF',
  'Domestic Conference': 'DOM_CONF'
};

const getNextSequence = async (phdId, typeCode) => {
  const result = await query(
    `SELECT COUNT(*) FROM phd_candidate_publication_info 
     WHERE phd_candidate_id = $1 AND type = $2`,
    [phdId, typeCode]
  );
  return result.rows[0].count + 1;
};

const generateFileName = (phdId, type, sequence, ext) => {
  const typeCode = typeCodes[type];
  return `${phdId}_PUB_${typeCode}_${sequence}${ext}`;
};

const savePublicationDocument = async (file, phdId, publicationType) => {
  const sequence = await getNextSequence(phdId, publicationType);
  const allowedTypes = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF and DOC files are allowed.');
  }
  const ext = path.extname(file.name);
  const filename = generateFileName(phdId, publicationType, sequence, ext);
  const targetPath = path.join(
    '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
    filename
  );
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`Success: Document saved at ${targetPath}`);
    return `/Storage/Documents/PhD_Candidate/${filename}`;
  } catch (error) {
    console.error(`Error: Failed to save document - ${error.message}`);
    throw new Error(`Failed to save document: ${error.message}`);
  }
};

export async function POST(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const memberId = req.cookies.get('id')?.value;
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    // Validate member ID
    if (!memberId) {
      console.warn('Warning: Member authentication failed');
      return NextResponse.json({ success: false, message: 'Member authentication failed' }, { status: 401 });
    }

    // Verify member exists and is PhD Candidate
    const memberCheck = await query(
      `SELECT type FROM member WHERE id = $1`,
      [memberId]
    );

    if (memberCheck.rows.length === 0) {
      console.warn('Warning: Member not found');
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    if (memberCheck.rows[0].type !== 'PhD Candidate') {
      console.warn('Warning: Publications can only be added by PhD Candidates');
      return NextResponse.json({ 
        success: false, 
        message: 'Publications can only be added by PhD Candidates' 
      }, { status: 403 });
    }

    const formData = await req.formData();
    const type = formData.get('type');
    const title = formData.get('title');
    const year = formData.get('year');
    const journalName = formData.get('journalName');
    const conferenceName = formData.get('conferenceName');
    let authors = formData.get('authors');
    const volume = formData.get('volume');
    const issue = formData.get('issue');
    const pageCount = formData.get('pageCount');
    const publishedDate = formData.get('publishedDate');
    const impactFactor = formData.get('impactFactor');
    const link = formData.get('link');
    const documentFile = formData.get('document');
    

    console.log('Received Data:', {
      type, title, year, journalName, conferenceName, authors, 
      volume, issue, pageCount, publishedDate, impactFactor, link, documentFile
    });

    // Check authors field
    try {
        if (authors) {
          console.log('Authors before JSON parse:', authors);
          authors = JSON.parse(authors);  // Parse the authors if it is a string
        }
      } catch (error) {
        console.error(`Error parsing authors: ${error.message}`);
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid JSON in authors field' 
        }, { status: 400 });
      }

    const serializedAuthors = JSON.stringify(authors);

    // Validation
    const requiredFields = [
      !type && 'Publication Type',
      !title && 'Title',
      !year && 'Year',
      !authors?.length && 'Authors',
      !pageCount && 'Page Count',
      !documentFile && 'Document'
    ].filter(Boolean);

    if (requiredFields.length > 0) {
      console.warn(`Warning: Missing required fields - ${requiredFields.join(', ')}`);
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${requiredFields.join(', ')}` 
      }, { status: 400 });
    }

    if (type.includes('Journal') && (!journalName || !volume || !issue)) {
      console.warn('Warning: Journal publications require journal name, volume and issue');
      return NextResponse.json({ 
        success: false, 
        message: 'Journal publications require journal name, volume and issue' 
      }, { status: 400 });
    }

    if (type.includes('Conference') && !conferenceName) {
      console.warn('Warning: Conference publications require conference name');
      return NextResponse.json({ 
        success: false, 
        message: 'Conference publications require conference name' 
      }, { status: 400 });
    }

    let documentUrl;
    try {
      documentUrl = await savePublicationDocument(documentFile, memberId, type);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 400 });
    }

    try {
      await query('BEGIN');
      
      const insertQuery = `
        INSERT INTO phd_candidate_publication_info (
            phd_candidate_id,
            type,
            title,
            year,
            journal_name,
            conference_name,
            authors,
            volume,
            issue,
            page_count,
            published_date,
            impact_factor,
            link,
            document_path,
            approval_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id;
        `;
      console.log('Executing Insert Query with Data:', [
        memberId, type, title, year, 
        type.includes('Journal') ? journalName : null,
        type.includes('Conference') ? conferenceName : null,
        authors, volume, issue, pageCount, 
        publishedDate || null, impactFactor || null, link || null, documentUrl
      ]);
      const result = await query(insertQuery, [
        memberId, 
        type,
        title,
        year,
        type.includes('Journal') ? journalName : null,
        type.includes('Conference') ? conferenceName : null,
        serializedAuthors,  // Pass the serialized authors here
        volume,
        issue,
        pageCount,
        publishedDate || null,
        impactFactor || null,
        link || null,
        documentUrl,
        'Pending' // Set default approval status
      ]);

      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${memberId}`; 
      const notificationTitle = `New Publication Added by ${memberId}`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      await query('COMMIT');

      const successMessage = formatAlertMessage(
        'New Publication Added',
        `Member ID: ${memberId}\nType: ${type}`
      );
      await sendTelegramAlert(successMessage);

      console.log(`Success: Publication added by member ${memberId}`);
      logger.info('Publication Added Successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Publication',
          details: `Publication added by member ${memberId}`
        }
      });

      return NextResponse.json({ 
        success: true,
        message: 'Publication added successfully'
      });
    } catch (error) {
      await query('ROLLBACK');
      const errorMessage = formatAlertMessage(
        'Publication Add Failed',
        `Member ID: ${memberId}\nError: ${error.message}`
      );
      await sendTelegramAlert(errorMessage);
      console.error(`Error: Publication add failed - ${error.message}`);
      logger.error('Publication Add Failed', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Publication',
          details: `Member ID: ${memberId} - Error: ${error.message}`
        }
      });
      return NextResponse.json({ 
        success: false, 
        message: `Error adding publication: ${error.message}` 
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = formatAlertMessage(
      'Publication Add Failed',
      `System Error: ${error.message}\nIP: ${ipAddress}`
    );
    await sendTelegramAlert(errorMessage);
    console.error(`Error: System error processing publication - ${error.message}`);
    logger.error('System Error Processing Publication', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Publication',
        details: `System error: ${error.message}`
      }
    });
    return NextResponse.json({ 
        success: false, 
        message: `System error: ${error.message}` 
      }, { status: 500 });
  }
}
