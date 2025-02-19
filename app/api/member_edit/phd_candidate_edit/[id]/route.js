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

const saveDocumentPhoto = async (file, phdCandidateId, index, document_type, eid, sessionId) => {
  if (!file) {
    logger.warn('No file provided for document photo', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `No file provided for document photo for phd candidate ID: ${phdCandidateId}`
      }
    });
    throw new Error('No file provided for document photo');
  }
  const filename = `${phdCandidateId}_Document_${document_type}_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/PhD_Candidate', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    logger.info('Document photo saved successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Document photo saved at ${targetPath} for phd candidate ID: ${phdCandidateId}`
      }
    });
    return `/Storage/Images/PhD_Candidate/${filename}`;
  } catch (error) {
    logger.error('Failed to save document photo', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Failed to save document photo at ${targetPath} for phd candidate ID: ${phdCandidateId}. Error: ${error.message}`
      }
    });
    throw new Error(`Failed to save document photo: ${error.message}`);
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

    const phdCandidateQuery = `SELECT * FROM phd_candidate_basic_info WHERE id = $1;`;
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

    const documentsQuery = `SELECT * FROM phd_candidate_document_info WHERE phd_candidate_id = $1;`;
    const documentsResult = await query(documentsQuery, [id]);

    const responseData = {
      ...phdCandidate,
      socialMedia: socialMediaResult.rows,
      education: educationResult.rows,
      career: careerResult.rows,
      documents: documentsResult.rows.map(doc => ({
        title: doc.title,
        document_type: doc.document_type,
        documentsPhoto: doc.document_photo, // Fix property name mismatch
        existing: true
      })),
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

// Main function to handle the DELETE request
export async function DELETE(req, { params }) {
  const { id } = await params; // Await params before using its properties
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const adminEmail = req.cookies.get('email')?.value || 'Unknown Email';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { documentId, documentType, documentTitle, documentPhoto } = await req.json();

    // Delete the document from the database
    const deleteDocumentQuery = `
      DELETE FROM phd_candidate_document_info
      WHERE phd_candidate_id = $1 AND document_type = $2 AND title = $3 AND document_photo = $4
    `;
    await query(deleteDocumentQuery, [id, documentType, documentTitle, documentPhoto]);

    // Construct the full file path
    const basePath = '/home/mvsd-lab/public';
    const filePath = path.join(basePath, documentPhoto);

    // Check if the file exists before attempting to delete it
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        logger.error('File does not exist', {
          meta: {
            eid,
            sid: sessionId,
            taskName: 'Edit PhD Candidate Data',
            details: `File does not exist at path: ${filePath} for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
          }
        });
      } else {
        // Remove the file from the server
        fs.unlink(filePath, (err) => {
          if (err) {
            logger.error('Failed to delete file', {
              meta: {
                eid,
                sid: sessionId,
                taskName: 'Edit PhD Candidate Data',
                details: `Failed to delete file at path: ${filePath} for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}. Error: ${err.message}`
              }
            });
          } else {
            logger.info('File deleted successfully', {
              meta: {
                eid,
                sid: sessionId,
                taskName: 'Edit PhD Candidate Data',
                details: `File deleted successfully at path: ${filePath} for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
              }
            });
          }
        });
      }
    });

    const successMessage = formatAlertMessage('Document Deleted Successfully', `ID: ${id}\nDocument: ${documentTitle}\nStatus: 200`);
    await sendTelegramAlert(successMessage);
    logger.info('Document deleted successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Document deleted for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Deleting Document', `ID: ${id}\nError: ${error.message}\nStatus: 500`);
    await sendTelegramAlert(errorMessage);
    logger.error('Error deleting document', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Edit PhD Candidate Data',
        details: `Error deleting document for ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ message: `Failed to delete document: ${error.message}` }, { status: 500 });
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

    const documents = [];
    for (let i = 0; formData.has(`documents[${i}][title]`); i++) {
      const documentPhoto = formData.get(`documents[${i}][documentsPhoto]`);
      const documentType = formData.get(`documents[${i}][document_type]`); // Retrieve document_type
      if (!formData.get(`documents[${i}][existing]`) === 'true' && !documentPhoto) {
        return NextResponse.json({ message: `Document photo is required for new document: ${formData.get(`documents[${i}][title]`)}` }, { status: 400 });
      }
      documents.push({
        title: formData.get(`documents[${i}][title]`),
        document_type: documentType, // Ensure document_type is included
        documentsPhoto: documentPhoto,
        existing: formData.get(`documents[${i}][existing]`) === 'true',
      });
    }
    
    const password = formData.get('password');

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

    // Update basic info
    if (first_name || last_name || phone || short_bio || status || leaving_date) {
      const newStatus = leaving_date ? 'Inactive' : status;
      const updateBasicInfoQuery = `
        UPDATE phd_candidate_basic_info
        SET first_name = $1, last_name = $2, phone = $3, short_bio = $4, status = $5, completion_date = $6
        WHERE id = $7
      `;
      await query(updateBasicInfoQuery, [first_name, last_name, phone, short_bio, newStatus, leaving_date, id]);

      const updateMemberQuery = `
        UPDATE member
        SET first_name = $1, last_name = $2, phone = $3, short_bio = $4, status = $5, leaving_date = $6, updated_at = NOW()
        WHERE id = $7
      `;
      await query(updateMemberQuery, [first_name, last_name, phone, short_bio, newStatus, leaving_date, id]);
      logger.info('Basic INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Basic info updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
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
        await query(insertCareerQuery, [id, job.position, job.organization_name, job.joining_year, job.leaving_year]);
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

    // Update documents
    if (documents.length > 0) {
      const newDocuments = documents.filter(document => !document.existing);

      const insertDocumentsQuery = `
        INSERT INTO phd_candidate_document_info (phd_candidate_id, title, document_type, document_photo) VALUES ($1, $2, $3, $4)
      `;
      const currentDocumentsCountQuery = `
        SELECT COUNT(*) FROM phd_candidate_document_info WHERE phd_candidate_id = $1
      `;
      const currentDocumentsCountResult = await query(currentDocumentsCountQuery, [id]);
      const currentDocumentsCount = parseInt(currentDocumentsCountResult.rows[0].count, 10);
      for (let i = 0; i < newDocuments.length; i++) {
        const document = newDocuments[i];
        let documentUrl = null;
        if (document.documentsPhoto) {
          documentUrl = await saveDocumentPhoto(document.documentsPhoto, id, currentDocumentsCount + i + 1, document.document_type, eid, sessionId); // Pass document_type
        }
        await query(insertDocumentsQuery, [id, document.title, document.document_type, documentUrl]);
      }
      logger.info('Document INFO Updated', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Edit PhD Candidate Data',
          details: `Document info updated for phd candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
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