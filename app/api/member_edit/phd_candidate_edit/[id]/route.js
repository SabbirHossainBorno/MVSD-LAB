//app/api/member_edit/phd_candidate_edit/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const saveProfilePhoto = async (file, phdCandidateId, eid, sessionId) => {
  const filename = `${phdCandidateId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/PhD_Candidate', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    logger.info('Profile photo saved successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Profile photo saved at ${targetPath} for phd candidate ID: ${phdCandidateId}`
      }
    });
    return `/Storage/Images/PhD_Candidate/${filename}`;
  } catch (error) {
    logger.error('Failed to save profile photo', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Failed to save profile photo at ${targetPath} for phd candidate ID: ${phdCandidateId}. Error: ${error.message}`
      }
    });
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

// Main function to handle the GET request
export async function GET(req, { params }) {
  const { id } = await params;  // Await params before using its properties
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const adminEmail = req.cookies.get('email')?.value || 'Unknown Email';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const apiCallMessage = formatAlertMessage('PhD Candidate Edit - API', `IP: ${ipAddress}\nStatus: 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching phd candidate data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidate Data',
        details: `Fetching phd candidate data for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    

    // NEW: Add existence checks to the query
    const phdCandidateQuery = `SELECT 
        *,
        TO_CHAR(completion_date, 'YYYY-MM-DD') as completion_date,
        (passport_number IS NOT NULL AND passport_number != '') as passport_exists,
        (blood_group IS NOT NULL AND blood_group != '') as blood_group_exists
      FROM phd_candidate_basic_info 
      WHERE id = $1
    `;

    const phdCandidateResult = await query(phdCandidateQuery, [id]);

    if (phdCandidateResult.rows.length === 0) {
      const notFoundMessage = formatAlertMessage('PhD Candidate Not Found', `ID: ${id}\nIP: ${ipAddress}\nStatus: 404`);
      await sendTelegramAlert(notFoundMessage);

      logger.warn('PhD Candidate not found', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Fetch PhD Candidate Data',
          details: `No phd candidate found with ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ message: 'PhD Candidate Not Found' }, { status: 404 });
    }

    const phdCandidate = phdCandidateResult.rows[0];

    const socialMediaQuery = `SELECT * FROM phd_candidate_socialmedia_info WHERE phd_candidate_id = $1;`;
    const socialMediaResult = await query(socialMediaQuery, [id]);

    const educationQuery = `SELECT * FROM phd_candidate_education_info WHERE phd_candidate_id = $1;`;
    const educationResult = await query(educationQuery, [id]);

    const careerQuery = `SELECT * FROM phd_candidate_career_info WHERE phd_candidate_id = $1;`;
    const careerResult = await query(careerQuery, [id]);

    const responseData = {
      ...phdCandidate,
      passport_exists: phdCandidate.passport_exists,
      blood_group_exists: phdCandidate.blood_group_exists,

      socialMedia: socialMediaResult.rows,
      education: educationResult.rows,
      career: careerResult.rows,
    };

    const successMessage = formatAlertMessage('Successfully Fetched PhD Candidate Data', `ID: ${id}\nIP: ${ipAddress}\nStatus: 200`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched phd candidate data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidate Data',
        details: `Successfully fetched phd candidate data for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching PhD Candidate Data', `ID: ${id}\nIP: ${ipAddress}\nError: ${error.message}\nStatus: 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching phd candidate data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidate Data',
        details: `Error fetching phd candidate data for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ message: `Failed to fetch phd candidate data: ${error.message}` }, { status: 500 });
  }
}

// Main function to handle the POST request
export async function POST(req, { params }) {
  const { id } = await params;  // Await params before using its properties
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const adminEmail = req.cookies.get('email')?.value || 'Unknown Email';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const apiCallMessage = formatAlertMessage('PhD Candidate Edit - API', `IP : ${ipAddress}\nStatus: 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Receiving form data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Receiving form data for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    const formData = await req.formData();

    // Extract form data
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const short_bio = formData.get('short_bio');
    const status = formData.get('status');
    const leaving_date = formData.get('leaving_date') || null; // Set to null if empty
    const photo = formData.get('photo');
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const other_emails = JSON.parse(formData.get('other_emails') || '[]');

    const alumni_status = status === 'Graduate' ? 'Valid' : 'Invalid';
    
    const password = formData.get('password');

    // NEW: Extract passport and blood group
    const passport_number = formData.get('passport_number') || null;
    const bloodGroup = formData.get('bloodGroup') || null;

    await query('BEGIN');

    // Update profile photo
    if (photo) {
      const photoUrl = await saveProfilePhoto(photo, id, eid, sessionId);
      const updatePhotoQuery = `
        UPDATE phd_candidate_basic_info
        SET photo = $1
        WHERE id = $2
      `;
      await query(updatePhotoQuery, [photoUrl, id]);

      const updateMemberPhotoQuery = `
        UPDATE member
        SET photo = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await query(updateMemberPhotoQuery, [photoUrl, id]);

      logger.info('Profile Photo Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Profile photo updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }


    // Validate phone uniqueness
    if (phone) {
      const phoneCheck = await query(
        'SELECT id FROM member WHERE phone = $1 AND id != $2',
        [phone, id]
      );
      if (phoneCheck.rows.length > 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { message: 'Phone number is already in use by another member.' },
          { status: 400 }
        );
      }
    }


    // Validate other emails
    if (other_emails.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      for (const email of other_emails) {
        // Validate email format
        if (!emailRegex.test(email)) {
          await query('ROLLBACK');
          logger.error('Invalid email format', {
            meta: {
              eid,
              sid: sessionId,
              taskName: 'Edit PhD Candidate Data',
              details: `Invalid email format: ${email} for PhD Candidate ${id}`
            }
          });
          return NextResponse.json(
            { message: `Invalid email format: ${email}` },
            { status: 400 }
          );
        }

        // Check against primary emails
        const memberCheck = await query(
          'SELECT id FROM member WHERE email = $1',
          [email]
        );
        if (memberCheck.rows.length > 0) {
          await query('ROLLBACK');
          logger.error('Email conflict with primary email', {
            meta: {
              eid,
              sid: sessionId,
              taskName: 'Edit PhD Candidate Data',
              details: `Email ${email} conflicts with existing primary email for PhD Candidate ${id}`
            }
          });
          return NextResponse.json(
            { message: `Email ${email} is already registered as primary email.` },
            { status: 400 }
          );
        }

        // Check against other PhD Candidate's additional emails
        const PhdCandidateCheck = await query(
          `SELECT id FROM phd_candidate_basic_info 
          WHERE $1 = ANY(other_emails) AND id != $2`,
          [email, id]
        );
        if (PhdCandidateCheck.rows.length > 0) {
          await query('ROLLBACK');
          logger.error('Email conflict with other PhD Candidate', {
            meta: {
              eid,
              sid: sessionId,
              taskName: 'Edit PhD Candidate Data',
              details: `Email ${email} exists in another PhD Candidate's records (PhD Candidate ${id})`
            }
          });
          return NextResponse.json(
            { message: `Email ${email} exists in another PhD Candidate's records.` },
            { status: 400 }
          );
        }
      }
    }

    // NEW: Fetch current passport and blood group status
    const currentPhd = await query(
      `SELECT passport_number, blood_group 
       FROM phd_candidate_basic_info 
       WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const currentPassport = currentPhd.rows[0]?.passport_number;
    const currentBloodGroup = currentPhd.rows[0]?.blood_group;

    // Update basic info
    if (first_name || last_name || phone || short_bio || status || leaving_date) {
      // Validate Graduate status
      if (status === 'Graduate' && !leaving_date) {
        await query('ROLLBACK');
        return NextResponse.json(
          { message: 'Graduation Date is required for Graduate status' },
          { status: 400 }
        );
      }
      // Auto-clear leaving date for Active status
      const cleanLeavingDate = status === 'Active' ? null : leaving_date;
      
      const updateBasicInfoQuery = `
        UPDATE phd_candidate_basic_info
        SET 
          first_name = $1, 
          last_name = $2, 
          phone = $3, 
          short_bio = $4, 
          status = $5, 
          completion_date = $6, 
          other_emails = $7,
          alumni_status = $8
        WHERE id = $9
      `;
      await query(updateBasicInfoQuery, [
        first_name,
        last_name,
        phone,
        short_bio,
        status,
        cleanLeavingDate,
        other_emails,
        alumni_status,  // New parameter
        id              // Moved to position 9
      ]);

      const updateMemberQuery = `
        UPDATE member
        SET first_name = $1, last_name = $2, phone = $3, short_bio = $4, status = $5, leaving_date = $6, updated_at = NOW()
        WHERE id = $7
      `;
      await query(updateMemberQuery, [first_name, last_name, phone, short_bio, status, cleanLeavingDate, id]);
      logger.info('Basic INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Basic info updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}, Emails: ${other_emails.join(', ')}`
        }
      });

      // NEW: Only update passport if not already set
      if (passport_number && !currentPassport) {
        const updatePassportQuery = `
          UPDATE phd_candidate_basic_info
          SET passport_number = $1
          WHERE id = $2
        `;
        await query(updatePassportQuery, [passport_number, id]);

        const updateMemberPassportQuery = `
          UPDATE member
          SET passport_number = $1
          WHERE id = $2
        `;
        await query(updateMemberPassportQuery, [passport_number, id]);

        logger.info('Passport Number Updated', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'Edit PhD Candidate Data',
            details: `Passport number set for phd candidate ID: ${id}`
          }
        });
      }

      // NEW: Only update blood group if not already set
      if (bloodGroup && !currentBloodGroup) {
        const updateBloodGroupQuery = `
          UPDATE phd_candidate_basic_info
          SET blood_group = $1
          WHERE id = $2
        `;
        await query(updateBloodGroupQuery, [bloodGroup, id]);

        const updateMemberBloodGroupQuery = `
          UPDATE member
          SET blood_group = $1
          WHERE id = $2
        `;
        await query(updateMemberBloodGroupQuery, [bloodGroup, id]);
          logger.info('Blood Group Updated', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'Edit PhD Candidate Data',
            details: `Blood group set to ${bloodGroup} for phd candidate ID: ${id}`
          }
        });
      }
    }

    // Update social media
    if (socialMedia.length > 0) {
      const deleteSocialMediaQuery = `
        DELETE FROM phd_candidate_socialmedia_info
        WHERE phd_candidate_id = $1
      `;
      await query(deleteSocialMediaQuery, [id]);

      const insertSocialMediaQuery = `
        INSERT INTO phd_candidate_socialmedia_info (phd_candidate_id, socialmedia_name, link)
        VALUES ($1, $2, $3)
      `;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [id, sm.socialmedia_name, sm.link]);
      }
      logger.info('Social Media Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Social Media info updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update education
    if (education.length > 0) {
      const deleteEducationQuery = `
        DELETE FROM phd_candidate_education_info
        WHERE phd_candidate_id = $1
      `;
      await query(deleteEducationQuery, [id]);

      const insertEducationQuery = `
        INSERT INTO phd_candidate_education_info (phd_candidate_id, degree, institution, passing_year)
        VALUES ($1, $2, $3, $4)
      `;
      for (const edu of education) {
        await query(insertEducationQuery, [id, edu.degree, edu.institution, edu.passing_year]);
      }
      logger.info('Education INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Education info updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update career
    if (career.length > 0) {
      const deleteCareerQuery = `
        DELETE FROM phd_candidate_career_info
        WHERE phd_candidate_id = $1
      `;
      await query(deleteCareerQuery, [id]);

      const insertCareerQuery = `
        INSERT INTO phd_candidate_career_info (phd_candidate_id, position, organization_name, joining_year, leaving_year)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const job of career) {
        // Convert empty strings to null for integer fields
        const joining_year = job.joining_year || job.joining_year === 0 
          ? parseInt(job.joining_year, 10) 
          : null;
        
        const leaving_year = job.leaving_year || job.leaving_year === 0 
          ? parseInt(job.leaving_year, 10) 
          : null;

        await query(insertCareerQuery, [
          id, 
          job.position, 
          job.organization_name, 
          joining_year, 
          leaving_year  // Now properly null if empty
        ]);
      }
      logger.info('Career INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Career info updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update password
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
      if (!passwordRegex.test(password)) {
        await query('ROLLBACK');

        return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
      }
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const updatePasswordQuery = `
        UPDATE phd_candidate_basic_info
        SET password = $1
        WHERE id = $2
      `;
      await query(updatePasswordQuery, [hashedPassword, id]);

      const updateMemberPasswordQuery = `
        UPDATE member
        SET password = $1
        WHERE id = $2
      `;
      await query(updateMemberPasswordQuery, [hashedPassword, id]);

      logger.info('Password Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Password updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    await query('COMMIT');

    const successMessage = formatAlertMessage('PhD Candidate Information Updated Successfully', `ID : ${id}\nUpdated By : ${adminEmail}`);
    await sendTelegramAlert(successMessage);

    logger.info('PhD Candidate information updated successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `PhD Candidate information updated successfully for ID: ${id} by ${adminEmail} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Insert notification
    const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
    const notificationTitle = `PhD Candidate [${id}] Updated By ${adminEmail}`;
    const notificationStatus = 'Unread';
    await query(insertNotificationQuery, [id, notificationTitle, notificationStatus]);

    return NextResponse.json({ message: 'PhD Candidate information updated successfully!' }, { status: 200 });

  } catch (error) {
    await query('ROLLBACK');

    const errorMessage = formatAlertMessage('Error Updating PhD Candidate Information', `ID : ${id}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error updating phd candidate information', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Error updating phd candidate information for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
  }
}