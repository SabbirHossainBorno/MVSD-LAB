// app/api/update-publication-status/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { pub_res_id, status, feedback } = await request.json();
  
  try {
    // Start database transaction
    await query('BEGIN');
    console.log('[Transaction] Started database transaction');

    // Update the publication status and feedback
    const updateQuery = `
      UPDATE phd_candidate_pub_res_info
      SET approval_status = $1, feedback = $2, updated_at = NOW()
      WHERE pub_res_id = $3
      RETURNING *;
    `;
    
    console.log(`[Database] Updating status for publication: ${pub_res_id}`);
    const result = await query(updateQuery, [status, feedback, pub_res_id]);
    
    if (result.rowCount === 0) {
      console.warn(`[Database] Publication not found: ${pub_res_id}`);
      await query('ROLLBACK');
      return NextResponse.json({ success: false, message: 'Publication not found' }, { status: 404 });
    }
    
    const updatedPublication = result.rows[0];
    console.log(`[Database] Publication updated successfully: ${pub_res_id}`);
    
    // Create notification
    console.log('[Notification] Creating notification entry');
    
    let notificationTitle;
    if (status === 'Approved') {
      notificationTitle = `${pub_res_id} Publication/Research Approved: ${updatedPublication.title.substring(0, 30)}...`;
    } else if (status === 'Rejected') {
      notificationTitle = `${pub_res_id} Publication Rejected: ${updatedPublication.title.substring(0, 30)}...`;
    } else {
      notificationTitle = `Publication Requires Revision: ${updatedPublication.title.substring(0, 30)}...`;
    }
    
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
        pub_res_id,
        notificationTitle,
        'Unread'
      ]);

      console.log('[Notification] Notification created successfully');
    ;
    
    // Commit transaction
    await query('COMMIT');
    console.log('[Transaction] Database transaction committed');

    // Email notification section
    try {
      console.log('[Email Notification] Preparing to send notifications');
      
      // 1. Get publication details
      const pubDetails = await query(
        `SELECT title, phd_candidate_id FROM phd_candidate_pub_res_info WHERE pub_res_id = $1`,
        [pub_res_id]
      );
      
      if (pubDetails.rows.length === 0) {
        throw new Error('Publication details not found');
      }
      
      const publicationTitle = pubDetails.rows[0].title;
      const phdCandidateId = pubDetails.rows[0].phd_candidate_id;
      
      // 2. Get member's email
      const memberResult = await query(
        `SELECT email FROM member WHERE id = $1`,
        [phdCandidateId]
      );
      
      const memberEmail = memberResult.rows[0]?.email;
      
      // 3. Get director's email
      const directorResult = await query(
        `SELECT email FROM director_basic_info WHERE id = 'D01MVSD'`
      );
      
      const directorEmail = directorResult.rows[0]?.email;
      
      if (!memberEmail && !directorEmail) {
        console.log('[Email Notification] No emails to send');
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

        const emailPromises = [];

        // Status colors for email styling
        let statusColor;
        if (status === 'Approved') {
          statusColor = 'green';
        } else if (status === 'Rejected') {
          statusColor = 'red';
        } else {
          statusColor = 'orange';
        }

        // Director email
        if (directorEmail) {
          let actionTaken;
          if (status === 'Approved') {
            actionTaken = 'approved';
          } else if (status === 'Rejected') {
            actionTaken = 'rejected';
          } else {
            actionTaken = 'marked as requiring revision';
          }
            
          const directorEmailHTML = `
            <p>Dear Director,</p>
            
            <p>You have <strong>${actionTaken}</strong> the following Publication/Research:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Publication/Research ID</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${pub_res_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Title</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${publicationTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
                <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">
                  ${status}
                </td>
              </tr>
              ${feedback ? `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Feedback</td>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-style: italic;">
                    ${feedback}
                  </td>
                </tr>
              ` : ''}
            </table>
            
            <p>This action has been recorded in the system.</p>
            
            <p>Sincerely,<br>
            <strong>MVSD LAB</strong></p>
          `;

          const directorSubject = `Publication/Research ${status} - ${pub_res_id}`;
          
          emailPromises.push(
            transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: directorEmail,
              subject: directorSubject,
              html: directorEmailHTML
            })
          );
          console.log(`[Email] Director notification prepared for: ${directorEmail}`);
        }

        // Member notification email
        if (memberEmail) {
          let statusMessage;
          let actionMessage;
          let resubmissionNote = '';
          
          if (status === 'Approved') {
            statusMessage = 'approved by the director';
            actionMessage = `
              <p>Congratulations! Your publication is now approved and visible in the MVSD LAB portfolio.</p>
              <p><strong>Resubmission:</strong> This publication cannot be resubmitted as it's now finalized.</p>
            `;
          } else if (status === 'Rejected') {
            statusMessage = 'rejected by the director';
            actionMessage = `
              <p>We regret to inform you that your publication has been rejected.</p>
              <p><strong>Resubmission:</strong> You can resubmit this publication after making changes. Please review the feedback below.</p>
            `;
          } else {
            statusMessage = 'marked as requiring revision by the director';
            actionMessage = `
              <p><strong>Action Required:</strong> Please review the feedback and submit a revised version.</p>
              <p><strong>Resubmission:</strong> You can resubmit this publication after making the requested revisions.</p>
            `;
          }
            
          const memberEmailHTML = `
            <p>Dear Research Member,</p>
            
            <p>Your Publication/Research has been <strong>${statusMessage}</strong>:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Publication/Research ID</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${pub_res_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Title</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${publicationTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
                <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">
                  ${status}
                </td>
              </tr>
              ${feedback ? `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Director's Feedback</td>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-style: italic;">
                    ${feedback}
                  </td>
                </tr>
              ` : ''}
            </table>
            
            ${actionMessage}
            
            <p>You can view your publication in the <a href="https://www.mvsdlab.com/login">MVSD LAB Member Dashboard</a>.</p>
            
            <p>Best Regards,<br>
            <strong>MVSD LAB</strong></p>
          `;

          const memberSubject = `Publication/Research ${status} - ${pub_res_id}`;
          
          emailPromises.push(
            transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: memberEmail,
              subject: memberSubject,
              html: memberEmailHTML
            })
          );
          console.log(`[Email] Member notification prepared for: ${memberEmail}`);
        }

        // Send all emails
        await Promise.all(emailPromises);
        console.log('[Email Notification] Emails sent successfully');
      }
    } catch (emailError) {
      console.error('[Email Notification Failed]', emailError.message);
      logger.error('Email sending failed', {
        meta: {
          pub_res_id,
          error: emailError.message,
          taskName: 'Update Publication Status Email'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      updatedPublication,
      message: `Publication status updated to ${status}`
    });
    
  } catch (error) {
    // Rollback transaction on error
    console.error('[Database Error] Rolling back transaction:', error.message);
    await query('ROLLBACK');
    
    logger.error('Error updating publication status', {
      meta: {
        pub_res_id,
        error: error.message,
        stack: error.stack,
        taskName: 'Update Publication Status'
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update publication status',
        error: error.message
      },
      { status: 500 }
    );
  }
}