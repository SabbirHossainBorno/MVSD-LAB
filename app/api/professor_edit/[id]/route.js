//app/api/professor_edit/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const saveProfilePhoto = async (file, professorId, eid, sessionId) => {
  const filename = `${professorId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    logger.info('Profile photo saved successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Profile photo saved at ${targetPath} for professor ID: ${professorId}`
      }
    });
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    logger.error('Failed to save profile photo', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Failed to save profile photo at ${targetPath} for professor ID: ${professorId}. Error: ${error.message}`
      }
    });
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};


const saveAwardPhoto = async (file, professorId, index, eid, sessionId) => {
  if (!file) {
    logger.warn('No file provided for award photo', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `No file provided for award photo for professor ID: ${professorId}`
      }
    });
    throw new Error('No file provided for award photo');
  }

  const filename = `${professorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    logger.info('Award photo saved successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Award photo saved at ${targetPath} for professor ID: ${professorId}`
      }
    });
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    logger.error('Failed to save award photo', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Failed to save award photo at ${targetPath} for professor ID: ${professorId}. Error: ${error.message}`
      }
    });
    throw new Error(`Failed to save award photo: ${error.message}`);
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
    const apiCallMessage = formatAlertMessage('Professor Edit - API', `IP: ${ipAddress}\nStatus: 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching professor data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professor Data',
        details: `Fetching professor data for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    const professorQuery = `
      SELECT 
        *,
        TO_CHAR(leaving_date, 'YYYY-MM-DD') as leaving_date 
      FROM professor_basic_info 
      WHERE id = $1
    `;
    const professorResult = await query(professorQuery, [id]);

    if (professorResult.rows.length === 0) {
      const notFoundMessage = formatAlertMessage('Professor Not Found', `ID: ${id}\nIP: ${ipAddress}\nStatus: 404`);
      await sendTelegramAlert(notFoundMessage);

      logger.warn('Professor not found', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Fetch Professor Data',
          details: `No professor found with ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ message: 'Professor Not Found' }, { status: 404 });
    }

    const professor = professorResult.rows[0];

    const socialMediaQuery = `SELECT * FROM professor_socialmedia_info WHERE professor_id = $1;`;
    const socialMediaResult = await query(socialMediaQuery, [id]);

    const educationQuery = `SELECT * FROM professor_education_info WHERE professor_id = $1;`;
    const educationResult = await query(educationQuery, [id]);

    const careerQuery = `SELECT * FROM professor_career_info WHERE professor_id = $1;`;
    const careerResult = await query(careerQuery, [id]);

    const researchQuery = `SELECT * FROM professor_research_info WHERE professor_id = $1;`;
    const researchResult = await query(researchQuery, [id]);

    const awardsQuery = `SELECT * FROM professor_award_info WHERE professor_id = $1;`;
    const awardsResult = await query(awardsQuery, [id]);

    const responseData = {
      ...professor,
      socialMedia: socialMediaResult.rows,
      education: educationResult.rows,
      career: careerResult.rows,
      researches: researchResult.rows,
      awards: awardsResult.rows.map(award => ({ ...award, existing: true })),
    };

    const successMessage = formatAlertMessage('Successfully Fetched Professor Data', `ID: ${id}\nIP: ${ipAddress}\nStatus: 200`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched professor data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professor Data',
        details: `Successfully fetched professor data for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Professor Data', `ID: ${id}\nIP: ${ipAddress}\nError: ${error.message}\nStatus: 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching professor data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professor Data',
        details: `Error fetching professor data for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ message: `Failed to fetch professor data: ${error.message}` }, { status: 500 });
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
    const apiCallMessage = formatAlertMessage('Professor Edit - API', `IP : ${ipAddress}\nStatus: 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Receiving form data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Receiving form data for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
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
    const researches = JSON.parse(formData.get('researches') || '[]');
    const other_emails = JSON.parse(formData.get('other_emails') || '[]');
    
    const awards = [];
    for (let i = 0; formData.has(`awards[${i}][title]`); i++) {
      awards.push({
        title: formData.get(`awards[${i}][title]`),
        year: formData.get(`awards[${i}][year]`),
        details: formData.get(`awards[${i}][details]`),
        awardPhoto: formData.get(`awards[${i}][awardPhoto]`),
        existing: formData.get(`awards[${i}][existing]`) === 'true',
      });
    }
    const password = formData.get('password');

    await query('BEGIN');

    // Update profile photo
    if (photo) {
      const photoUrl = await saveProfilePhoto(photo, id, eid, sessionId);
      const updatePhotoQuery = `
        UPDATE professor_basic_info
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
          taskName: 'Edit Professor Data',
          details: `Profile photo updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
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
              taskName: 'Edit Professor Data',
              details: `Invalid email format: ${email} for professor ${id}`
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
              taskName: 'Edit Professor Data',
              details: `Email ${email} conflicts with existing primary email for professor ${id}`
            }
          });
          return NextResponse.json(
            { message: `Email ${email} is already registered as primary email.` },
            { status: 400 }
          );
        }

        // Check against other professors' additional emails
        const professorCheck = await query(
          `SELECT id FROM professor_basic_info 
          WHERE $1 = ANY(other_emails) AND id != $2`,
          [email, id]
        );
        if (professorCheck.rows.length > 0) {
          await query('ROLLBACK');
          logger.error('Email conflict with other professor', {
            meta: {
              eid,
              sid: sessionId,
              taskName: 'Edit Professor Data',
              details: `Email ${email} exists in another professor's records (professor ${id})`
            }
          });
          return NextResponse.json(
            { message: `Email ${email} exists in another professor's records.` },
            { status: 400 }
          );
        }
      }
    }

    // Update basic info
    if (first_name || last_name || phone || short_bio || status || leaving_date) {
  // Validate Emeritus status
  if (status === 'Emeritus' && !leaving_date) {
    await query('ROLLBACK');
    return NextResponse.json(
      { message: 'Leaving date is required for Emeritus status' },
      { status: 400 }
    );
  }

  // Auto-clear leaving date for Active status
  const cleanLeavingDate = status === 'Active' ? null : leaving_date;

  const updateBasicInfoQuery = `
    UPDATE professor_basic_info
    SET 
      first_name = $1,
      last_name = $2,
      phone = $3,
      short_bio = $4,
      status = $5,
      leaving_date = $6,
      other_emails = $7
    WHERE id = $8
  `;

  await query(updateBasicInfoQuery, [
    first_name,
    last_name,
    phone,
    short_bio,
    status,
    cleanLeavingDate,  // This will be null for Active status
    other_emails,
    id
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
          taskName: 'Edit Professor Data',
          details: `Basic info updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}------Phone: ${phone}, Emails: ${other_emails.join(', ')}`
        }
      });
    }

    // Update social media
    if (socialMedia.length > 0) {
      const deleteSocialMediaQuery = `
        DELETE FROM professor_socialmedia_info
        WHERE professor_id = $1
      `;
      await query(deleteSocialMediaQuery, [id]);

      const insertSocialMediaQuery = `
        INSERT INTO professor_socialmedia_info (professor_id, socialmedia_name, link)
        VALUES ($1, $2, $3)
      `;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [id, sm.socialmedia_name, sm.link]);
      }
      logger.info('Social Media Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit Professor Data',
          details: `Social Media info updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update education
    if (education.length > 0) {
      const deleteEducationQuery = `
        DELETE FROM professor_education_info
        WHERE professor_id = $1
      `;
      await query(deleteEducationQuery, [id]);

      const insertEducationQuery = `
        INSERT INTO professor_education_info (professor_id, degree, institution, passing_year)
        VALUES ($1, $2, $3, $4)
      `;
      for (const edu of education) {
        await query(insertEducationQuery, [id, edu.degree, edu.institution, edu.passing_year]);
      }
      logger.info('Education INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit Professor Data',
          details: `Education info updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update career
    if (career.length > 0) {
      const deleteCareerQuery = `
        DELETE FROM professor_career_info
        WHERE professor_id = $1
      `;
      await query(deleteCareerQuery, [id]);

      const insertCareerQuery = `
        INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const job of career) {
        await query(insertCareerQuery, [id, job.position, job.organization_name, job.joining_year, job.leaving_year]);
      }
      logger.info('Career INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit Professor Data',
          details: `Career info updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update Research Paper
    if (researches.length > 0) {
      const deleteResearchQuery = `
        DELETE FROM professor_research_info
        WHERE professor_id = $1
      `;
      await query(deleteResearchQuery, [id]);

      const insertResearchQuery = `
        INSERT INTO professor_research_info (professor_id, title, link, research_type)
        VALUES ($1, $2, $3, $4)
      `;
      for (const research of researches) {
        await query(insertResearchQuery, [id, research.title, research.link, research.research_type]);
      }
      logger.info('Research Paper INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit Professor Data',
          details: `Research Paper info updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    // Update awards
    if (awards.length > 0) {
      const newAwards = awards.filter(award => !award.existing);

      const insertAwardsQuery = `
        INSERT INTO professor_award_info (professor_id, title, year, details, award_photo)
        VALUES ($1, $2, $3, $4, $5)
      `;

      const currentAwardsCountQuery = `
        SELECT COUNT(*) FROM professor_award_info WHERE professor_id = $1
      `;
      const currentAwardsCountResult = await query(currentAwardsCountQuery, [id]);
      const currentAwardsCount = parseInt(currentAwardsCountResult.rows[0].count, 10);

      for (let i = 0; i < newAwards.length; i++) {
        const award = newAwards[i];
        let awardUrl = null;
        if (award.awardPhoto) {
          awardUrl = await saveAwardPhoto(award.awardPhoto, id, currentAwardsCount + i + 1);
        }
        await query(insertAwardsQuery, [id, award.title, award.year, award.details, awardUrl]);
      }
      logger.info('Award INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit Professor Data',
          details: `Award info updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
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
        UPDATE professor_basic_info
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
          taskName: 'Edit Professor Data',
          details: `Password updated for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    await query('COMMIT');

    const successMessage = formatAlertMessage('Professor Information Updated Successfully', `ID : ${id}\nUpdated By : ${adminEmail}`);
    await sendTelegramAlert(successMessage);

    logger.info('Professor information updated successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Professor information updated successfully for ID: ${id} by ${adminEmail} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Insert notification
    const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
    const notificationTitle = `Professor [${id}] Updated By ${adminEmail}`;
    const notificationStatus = 'Unread';
    await query(insertNotificationQuery, [id, notificationTitle, notificationStatus]);

    return NextResponse.json({ message: 'Professor information updated successfully!' }, { status: 200 });

  } catch (error) {
    await query('ROLLBACK');

    const errorMessage = formatAlertMessage('Error Updating Professor Information', `ID : ${id}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error updating professor information', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit Professor Data',
        details: `Error updating professor information for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
  }
}