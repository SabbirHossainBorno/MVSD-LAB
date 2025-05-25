//app/api/member_publication_edit/[id]/route.js
// app/api/member_publication_edit/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n${title}\n${details}`;
};

const savePublicationDocument = async (file, pubResId, existingPath) => {
  if (!file) return existingPath;

  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF files are allowed');
  }

  // Remove existing file if present
  if (existingPath) {
    try {
      const fullPath = path.join('/home/mvsd-lab/public', existingPath);
      fs.unlinkSync(fullPath);
    } catch (error) {
      console.error('Error removing old document:', error.message);
    }
  }

  const filename = `${pubResId}${path.extname(file.name)}`;
  const targetPath = path.join(
    '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
    filename
  );

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Documents/PhD_Candidate/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save document: ${error.message}`);
  }
};

export async function GET(req, { params }) {
  const { id } = params;
  
  try {
    const result = await query(
      `SELECT 
        pub_res_id AS id,
        type,
        title,
        publishing_year AS year,
        authors,
        published_date AS "publishedDate",
        link,
        document_path AS "documentPath",
        approval_status AS "approvalStatus"
      FROM phd_candidate_pub_res_info
      WHERE pub_res_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      );
    }

    const publication = {
      ...result.rows[0],
      authors: Array.isArray(result.rows[0].authors) 
        ? result.rows[0].authors 
        : JSON.parse(result.rows[0].authors || '[]')
    };

    return NextResponse.json({ publication });
  } catch (error) {
    logger.error('Publication fetch failed', {
      meta: {
        details: error.message,
        stack: error.stack,
        severity: 'CRITICAL'
      }
    });
    return NextResponse.json(
      { error: 'Failed to fetch publication' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const memberId = req.cookies.get('id')?.value;
  const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown IP';

  try {
    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const existingDocument = formData.get('existingDocument');

    // Check publication status
    const statusCheck = await query(
      `SELECT approval_status FROM phd_candidate_pub_res_info
       WHERE pub_res_id = $1 AND phd_candidate_id = $2`,
      [id, memberId]
    );

    if (statusCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Publication not found' },
        { status: 404 }
      );
    }

    if (statusCheck.rows[0].approval_status === 'Approved') {
      return NextResponse.json(
        { success: false, message: 'Approved publications cannot be modified' },
        { status: 403 }
      );
    }

    // Handle document upload
    let documentPath = existingDocument;
    const documentFile = formData.get('document');
    if (documentFile && documentFile.size > 0) {
      documentPath = await savePublicationDocument(documentFile, id, existingDocument);
    }

    // Update publication data
    const updateData = {
      type: formData.get('type'),
      title: formData.get('title'),
      publishing_year: formData.get('publishing_year'),
      authors: JSON.parse(formData.get('authors')),
      published_date: formData.get('published_date') || null,
      link: formData.get('link'),
      document_path: documentPath
    };

    await query('BEGIN');

    try {
      await query(
        `UPDATE phd_candidate_pub_res_info
         SET
           type = $1,
           title = $2,
           publishing_year = $3,
           authors = $4,
           published_date = $5,
           link = $6,
           document_path = $7,
           approval_status = 'Pending',
           updated_at = NOW()
         WHERE pub_res_id = $8`,
        [
          updateData.type,
          updateData.title,
          updateData.publishing_year,
          JSON.stringify(updateData.authors),
          updateData.published_date,
          updateData.link,
          updateData.document_path,
          id
        ]
      );

      // Update notification
      await query(
        `UPDATE notification_details
         SET title = $1, status = 'Unread', created_at = NOW()
         WHERE id = $2`,
        [`Updated Publication: ${updateData.title.substring(0, 30)}...`, id]
      );

      await query('COMMIT');
    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError;
    }

    // Log and notify
    logger.info('Publication updated successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Publication',
        details: `PUB_RES_ID: ${id}`
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Publication Updated',
      `PUB_RES_ID: ${id}\nMember: ${memberId}\nIP: ${ipAddress}`
    ));

    return NextResponse.json({
      success: true,
      message: 'Publication updated successfully'
    });

  } catch (error) {
    logger.error('Publication update failed', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Publication',
        details: `Error: ${error.message}\nStack: ${error.stack}`
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Update Failed',
      `Error: ${error.message}\nPUB_RES_ID: ${id}\nIP: ${ipAddress}`
    ));

    return NextResponse.json(
      { success: false, message: `Update failed: ${error.message}` },
      { status: 500 }
    );
  }
}