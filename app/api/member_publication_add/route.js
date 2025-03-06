// app/api/member_publication_add/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const savePublicationDocument = async (file, memberId) => {
  const allowedTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF and DOC files are allowed.');
  }

  const ext = path.extname(file.name);
  const filename = `${memberId}_PUB_${Date.now()}${ext}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Documents/Publications', filename);
  
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Documents/Publications/${filename}`;
  } catch (error) {
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
      return NextResponse.json({ success: false, message: 'Member authentication failed' }, { status: 401 });
    }

    // Verify member exists and is PhD Candidate
    const memberCheck = await query(
      `SELECT type FROM member WHERE id = $1`,
      [memberId]
    );
    
    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }
    
    if (memberCheck.rows[0].type !== 'PhD Candidate') {
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
    const authors = JSON.parse(formData.get('authors'));
    const volume = formData.get('volume');
    const issue = formData.get('issue');
    const pageCount = formData.get('pageCount');
    const publishedDate = formData.get('publishedDate');
    const impactFactor = formData.get('impactFactor');
    const link = formData.get('link');
    const documentFile = formData.get('document');

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
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${requiredFields.join(', ')}` 
      }, { status: 400 });
    }

    if (type.includes('Journal') && (!journalName || !volume || !issue)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Journal publications require journal name, volume and issue' 
      }, { status: 400 });
    }

    if (type.includes('Conference') && !conferenceName) {
      return NextResponse.json({ 
        success: false, 
        message: 'Conference publications require conference name' 
      }, { status: 400 });
    }

    let documentUrl;
    try {
      documentUrl = await savePublicationDocument(documentFile, memberId);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 400 });
    }

    try {
      await query('BEGIN');

      // Insert into phd_candidate_publication_info
      const insertQuery = `
        INSERT INTO phd_candidate_publication_info (
          phd_candidate_id, type, title, year, journal_name, conference_name, 
          authors, volume, issue, page_count, published_date, impact_factor, 
          link, document_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `;

      const result = await query(insertQuery, [
        memberId,
        type,
        title,
        year,
        type.includes('Journal') ? journalName : null,
        type.includes('Conference') ? conferenceName : null,
        authors,
        volume,
        issue,
        pageCount,
        publishedDate || null,
        impactFactor || null,
        link || null,
        documentUrl
      ]);

      const publicationId = result.rows[0].id;

      // Insert notification
      const notificationId = `NOTIF${publicationId}`;
      await query(
        `INSERT INTO notification_details (id, title, status)
         VALUES ($1, $2, $3)`,
        [notificationId, `New Publication Added by ${memberId}`, 'Unread']
      );

      await query('COMMIT');

      // Send Telegram alert
      const successMessage = formatAlertMessage(
        'New Publication Added',
        `Member ID: ${memberId}\nPublication ID: ${publicationId}\nType: ${type}`
      );
      await sendTelegramAlert(successMessage);

      // Log success
      logger.info('Publication Added Successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Publication',
          details: `Publication ${publicationId} added by member ${memberId}`
        }
      });

      return NextResponse.json({ 
        success: true, 
        publicationId,
        message: 'Publication added successfully'
      });

    } catch (error) {
      await query('ROLLBACK');
      
      const errorMessage = formatAlertMessage(
        'Publication Add Failed',
        `Member ID: ${memberId}\nError: ${error.message}`
      );
      await sendTelegramAlert(errorMessage);

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