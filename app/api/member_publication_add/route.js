// app/api/member_publication_add/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formatAlertMessage = (title, details) => {
  return `MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n${title}\n${details}`;
};

const generatePublicationId = async () => {
  const result = await query(
    'SELECT pub_res_id FROM phd_candidate_pub_res_info ORDER BY pub_res_id DESC LIMIT 1'
  );

  let lastNumber = 0;
  if (result.rows.length > 0) {
    const lastId = result.rows[0].pub_res_id;
    const match = lastId.match(/PUB(\d+)RESMVSD/);
    if (match) lastNumber = parseInt(match[1]);
  }

  const newNumber = lastNumber + 1;
  return `PUB${newNumber.toString().padStart(2, '0')}RESMVSD`;
};

// Helper: Save publication document with proper renaming
const savePublicationDocument = async (file, pubResId, existingPath) => {
  try {
    console.log(`[DOCUMENT PROCESSING] Starting for ${pubResId}`);
    
    // Validate file exists
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    console.log(`Original file name: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 5MB limit (${(file.size/1024/1024).toFixed(2)}MB)`);
    }

    // Validate file type - only PDF allowed
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF files are allowed');
    }

    // Get and validate file extension
    const extension = path.extname(file.name).toLowerCase();
    if (extension !== '.pdf') {
      throw new Error('File must have .pdf extension');
    }

    // Remove existing file if exists
    if (existingPath) {
      const fullPath = path.join('/home/mvsd-lab/public', existingPath);
      console.log(`[REMOVE EXISTING] Attempting to remove: ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`[REMOVED] Successfully deleted: ${fullPath}`);
        } catch (removeError) {
          console.error(`[REMOVE ERROR] Failed to delete: ${fullPath}`, removeError);
          throw new Error(`Failed to remove existing document: ${removeError.message}`);
        }
      } else {
        console.warn(`[REMOVE WARNING] File not found: ${fullPath}`);
      }
    }

    // Create new filename using publication ID and original extension
    const newFilename = `${pubResId}${extension}`;
    const targetPath = path.join(
      '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
      newFilename
    );

    console.log(`[SAVING DOCUMENT] New filename: ${newFilename}`);
    console.log(`Saving to: ${targetPath}`);
    
    try {
      // Convert file to buffer and save
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      console.log(`[DOCUMENT SAVED] Successfully saved: ${newFilename}`);
      
      return `/Storage/Documents/PhD_Candidate/${newFilename}`;
    } catch (writeError) {
      console.error(`[SAVE ERROR] Failed to write file: ${writeError.message}`);
      throw new Error(`Failed to save document: ${writeError.message}`);
    }
    
  } catch (error) {
    console.error(`[DOCUMENT PROCESSING ERROR] ${error.message}`);
    throw error;
  }
};

export async function POST(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const memberId = req.cookies.get('id')?.value;
  const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown IP';

  console.log(`[${new Date().toISOString()}] Starting publication submission process for member: ${memberId}`);
  console.log(`[Request Metadata] IP: ${ipAddress}, Session: ${sessionId}, EID: ${eid}`);

  try {
    // Validate authentication
    if (!memberId) {
      console.error('[Auth Error] No member ID found in cookies');
      return NextResponse.json(
        { success: false, message: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Verify member is PhD Candidate
    console.log(`[Member Verification] Checking member status for: ${memberId}`);
    const memberCheck = await query(
      `SELECT type FROM member WHERE id = $1`,
      [memberId]
    );

    if (memberCheck.rows.length === 0 || memberCheck.rows[0].type !== 'PhD Candidate') {
      console.warn(`[Authorization Failed] Member ${memberId} is not a PhD candidate`);
      return NextResponse.json(
        { success: false, message: 'Publications can only be added by PhD Candidates' },
        { status: 403 }
      );
    }

    // Generate publication ID
    console.log('[ID Generation] Generating new publication ID');
    const pubResId = await generatePublicationId();
    console.log(`[ID Generated] New PUB_RES_ID: ${pubResId}`);

    // Process form data
    console.log('[Form Processing] Parsing form data');
    const formData = await req.formData();

    // Add year parsing and validation here
    const publishingYear = parseInt(formData.get('publishing_year'));
    if (isNaN(publishingYear) || publishingYear < 1900 || publishingYear > new Date().getFullYear()) {
      console.error(`[Validation Failed] Invalid year: ${formData.get('publishing_year')}`);
      return NextResponse.json(
        { success: false, message: 'Invalid publication year' },
        { status: 400 }
      );
    }
    
    // Handle document upload
    let documentPath = null;
    const documentFile = formData.get('document');
    if (documentFile) {
      console.log(`[File Upload] Processing document upload - File name: ${documentFile.name}, Size: ${documentFile.size} bytes`);
      try {
        documentPath = await savePublicationDocument(documentFile, pubResId);
        console.log(`[File Upload Success] Document stored at: ${documentPath}`);
      } catch (error) {
        console.error('[File Upload Failed]', error.message);
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
    } else {
      console.log('[File Upload] No document provided, proceeding without file upload');
    }

    // Prepare publication data
    console.log('[Data Preparation] Parsing and validating form data');
    const publicationData = {
      pub_res_id: pubResId,
      phd_candidate_id: memberId,
      type: formData.get('type'),
      title: formData.get('title'),
      publishing_year: publishingYear,
      authors: JSON.parse(formData.get('authors')),
      published_date: formData.get('published_date') || null,
      link: formData.get('link'),
      document_path: documentPath
    };

    console.log('[Publication Data]', {
      type: publicationData.type,
      title: publicationData.title.substring(0, 50) + '...',
      year: publicationData.publishing_year,
      authorCount: publicationData.authors.length,
      hasDocument: !!documentPath
    });

    // Validate required fields
    console.log('[Validation] Checking required fields');
    const requiredFields = {
      type: 'Publication type',
      title: 'Title',
      publishing_year: 'Publishing year',
      authors: 'Authors',
      link: 'Link'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !publicationData[key])
      .map(([, name]) => name);

    if (missingFields.length > 0) {
      console.error('[Validation Failed] Missing fields:', missingFields);
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate year format
    if (isNaN(publicationData.publishing_year) || 
        publicationData.publishing_year < 1900 || 
        publicationData.publishing_year > new Date().getFullYear()) {
      console.error(`[Validation Failed] Invalid year: ${publicationData.publishing_year}`);
      return NextResponse.json(
        { success: false, message: 'Invalid publication year' },
        { status: 400 }
      );
    }

    // Database transaction
    console.log('[Database] Starting transaction');
    await query('BEGIN');

    try {
      // Insert publication
      console.log('[Database] Executing publication insert');
      const insertQuery = `
        INSERT INTO phd_candidate_pub_res_info (
          pub_res_id,
          phd_candidate_id,
          type,
          title,
          publishing_year,
          authors,
          published_date,
          link,
          document_path,
          approval_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending')
        RETURNING pub_res_id;
      `;

      const result = await query(insertQuery, [
        publicationData.pub_res_id,
        publicationData.phd_candidate_id,
        publicationData.type,
        publicationData.title,
        publicationData.publishing_year,
        JSON.stringify(publicationData.authors),
        publicationData.published_date,
        publicationData.link,
        publicationData.document_path
      ]);

      console.log(`[Database] Insert successful for PUB_RES_ID: ${result.rows[0].pub_res_id}`);

      // Create notification
      console.log('[Notification] Creating notification entry');
      const notificationQuery = `
        INSERT INTO notification_details (
          id,
          title,
          status
        ) VALUES ($1, $2, $3)
      `;

      await query(notificationQuery, [
        pubResId,
        `New Publication/Research Submitted: ${publicationData.title.substring(0, 30)}...`,
        'Unread'
      ]);

      console.log('[Notification] Notification created successfully');

      await query('COMMIT');
      console.log('[Database] Transaction committed successfully');

      try {
  console.log('[Email Notification] Preparing to send notifications');
  
  // 1. Get director's email
  const directorResult = await query(
    `SELECT email FROM director_basic_info WHERE id = 'D01MVSD'`
  );
  
  const directorEmail = directorResult.rows[0]?.email;
  
  // 2. Get member's email
  const memberResult = await query(
    `SELECT email FROM member WHERE id = $1`,
    [memberId]
  );
  
  const memberEmail = memberResult.rows[0]?.email;
  
  if (!directorEmail || !memberEmail) {
    console.warn('[Email Notification] Missing emails - Director:', directorEmail, 'Member:', memberEmail);
  } else {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
const directorEmailHTML = `
  <p>Dear Director,</p>
  
  <p>A <strong>new Publication/Research</strong> has been submitted by <strong>${memberId}</strong> (${memberEmail}).</p>
  
  <p>Publication Details:</p>
  <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Publication/Research ID</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${pubResId}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Title</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.title}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.type}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Publishing Year</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.publishing_year}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Authors</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.authors.join(', ')}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Link</td>
      <td style="padding: 8px; border: 1px solid #ddd;">
        <a href="${publicationData.link}">${publicationData.link}</a>
      </td>
    </tr>
  </table>
  
  <p>This submission is now pending your review and approval in the <a href="https://www.mvsdlab.com/login">MVSD LAB Director Portal</a>.</p>
  
  <p>Sincerely,<br>
  <strong>MVSD LAB</strong></p>
  
  <p style="margin-top: 20px; font-size: 12px; color: #666;">
    <strong>Quick Action:</strong> <a href="https://www.mvsdlab.com/login">Review New Publication Now</a>
  </p>
`;

// Then push to emails array
emails.push({
  from: process.env.EMAIL_FROM,
  to: directorEmail,
  subject: `New Publication Submitted - ${pubResId}`,
  html: directorEmailHTML
});

        // Member confirmation (HTML version)
    if (memberEmail) {
      const memberEmailContentHTML = `
        <p>Dear Research Member,</p>
        
        <p>Your Publication/Research has been successfully submitted:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Publication/Research ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${pubResId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Title</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.type}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Publishing Year</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${publicationData.publishing_year}</td>
          </tr>
        </table>
        
        <p>Your submission is now pending review by the director. You'll be notified once it's approved.</p>
        
        <p>Thank you for your contribution to MVSD LAB Publication/Research.</p>
        
        <p>Best Regards,<br>
        <strong>MVSD LAB</strong></p>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          You can view your submissions at : <a href="https://www.mvsdlab.com/login">MVSD LAB Member Dashboard</a>
        </p>
      `;

      emails.push({
        from: process.env.EMAIL_FROM,
        to: memberEmail,
        subject: `Publication Submitted Successfully - ${pubResId}`,
        html: memberEmailContentHTML
      });
    }

        // 4. Send emails
        const emailPromises = [];
        
        if (directorEmail) {
          emailPromises.push(
            transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: directorEmail,
              subject: `New Publication Submission - ${pubResId}`,
              text: directorEmailContent
            })
          );
        }
        
        if (memberEmail) {
          emailPromises.push(
            transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: memberEmail,
              subject: `Publication Submitted Successfully - ${pubResId}`,
              text: memberEmailContent
            })
          );
        }
        
        // Wait for all emails to send
        await Promise.all(emailPromises);
        console.log('[Email Notification] Emails sent successfully');
      }
    } catch (emailError) {
      console.error('[Email Notification Failed]', emailError.message);
      logger.error('Email sending failed', {
        meta: {
          pub_res_id: pubResId,
          error: emailError.message,
          taskName: 'Add Publication Email'
        }
      });
    }

    } catch (dbError) {
      console.error('[Database Error] Rolling back transaction:', dbError.message);
      await query('ROLLBACK');
      throw dbError;
    }

    // Log success
    console.log(`[Success] Publication submitted successfully - PUB_RES_ID: ${pubResId}`);
    logger.info('Publication submitted successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Publication',
        details: `PUB_RES_ID: ${pubResId}, Member: ${memberId}`
      }
    });

    // Send Telegram alert
    const successMessage = formatAlertMessage(
      'New Publication/Research Submission',
      `PUB_RES_ID: ${pubResId}\nMember: ${memberId}\nType: ${publicationData.type}`
    );
    await sendTelegramAlert(successMessage);

    return NextResponse.json({
      success: true,
      message: 'Publication/Research submitted successfully',
      pub_res_id: pubResId
    });

  } catch (error) {
    console.error('[System Error]', error);
    await query('ROLLBACK');
    
    logger.error('Publication submission failed', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Publication',
        details: `Error: ${error.message}\nStack: ${error.stack}`
      }
    });

    const errorMessage = formatAlertMessage(
      'Submission Failed',
      `Error: ${error.message}\nIP: ${ipAddress}\nStack: ${error.stack.substring(0, 200)}...`
    );
    await sendTelegramAlert(errorMessage);

    return NextResponse.json(
      { success: false, message: `Submission failed: ${error.message}` },
      { status: 500 }
    );
  }
}