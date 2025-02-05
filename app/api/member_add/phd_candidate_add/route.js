// app/api/member_add/phd_candidate_add/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const generatePhdCandidateId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM phd_candidate_basic_info');
    const maxId = result.rows[0]?.max_id || 'PHDC00MVSD';
    const numericPart = parseInt(maxId.substring(4, maxId.length - 4), 10) || 0;
    const nextId = numericPart + 1;
    const newId = `PHDC${String(nextId).padStart(2, '0')}MVSD`;
    console.log('Generated PhD Candidate ID:', newId);
    return newId;
  } catch (error) {
    console.error('Error generating PhD Candidate ID:', error.message);
    throw new Error(`Error generating PhD Candidate ID: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, phdCandidateId) => {
  const filename = `${phdCandidateId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/PhD_Candidate', filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log('Profile photo saved successfully:', filename);
    return `/Storage/Images/PhD_Candidate/${filename}`;
  } catch (error) {
    console.error('Failed to save profile photo:', error.message);
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

const saveDocumentPhoto = async (file, phdCandidateId, index, documentType) => {
  const filename = `${phdCandidateId}_Document_${documentType}_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/PhD_Candidate', filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log('Document photo saved successfully:', filename);
    return `/Storage/Images/PhD_Candidate/${filename}`;
  } catch (error) {
    console.error('Failed to save document photo:', error.message);
    throw new Error(`Failed to save document photo: ${error.message}`);
  }
};

export async function POST(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const adminEmail = req.cookies.get('email')?.value || 'Unknown Email';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  console.log('Received request to add PhD Candidate:', { sessionId, eid, adminEmail, ipAddress, userAgent });

  try {
    const formData = await req.formData();
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const gender = formData.get('gender');
    const bloodGroup = formData.get('bloodGroup');
    const country = formData.get('country');
    const idNumber = formData.get('idNumber');
    const passport_number = formData.get('passport_number');
    const dob = formData.get('dob');
    const email = formData.get('email');
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const admission_date = formData.get('admission_date');
    const completion_date = formData.get('completion_date') || null;
    const type = formData.get('type') || 'PhD Candidate';
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const documents = [];

    for (let i = 0; formData.has(`documents[${i}][title]`); i++) {
      documents.push({
        title: formData.get(`documents[${i}][title]`),
        documentType: formData.get(`documents[${i}][documentType]`),
        documentPhoto: formData.get(`documents[${i}][documentsPhoto]`),
      });
    }

    console.log('Form data received:', { first_name, last_name, phone, gender, bloodGroup, country, idNumber, passport_number, dob, email, password, short_bio, admission_date, completion_date, type, socialMedia, education, career, documents });

    // Validation
    if (!first_name || !last_name || !phone || !gender || !bloodGroup || !country || !idNumber || !passport_number || !dob || !email || !password || !short_bio || !admission_date) {
      console.warn('Validation Error: Missing required fields', { first_name, last_name, phone, gender, bloodGroup, country, idNumber, passport_number, dob, email, password, short_bio, admission_date });
      return NextResponse.json({ message: 'All required fields must be filled.' }, { status: 400 });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.warn('Validation Error: Invalid password format', { password });
      return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
    }

    // Age validation
    const currentDate = new Date();
    const dobDate = new Date(dob);
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const monthDifference = currentDate.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      console.warn('Validation Error: Age less than 18', { dob, age });
      return NextResponse.json({ message: 'PhD Candidate must be at least 18 years old.' }, { status: 400 });
    }

    // Admission date validation
    const admissionYear = new Date(admission_date).getFullYear();
    if (admissionYear > currentDate.getFullYear()) {
      console.warn('Validation Error: Admission date greater than current year', { admission_date, admissionYear });
      return NextResponse.json({ message: 'Admission date cannot be greater than the current year.' }, { status: 400 });
    }

    // Education and Career Year validation
    const validateYear = (year) => year <= currentDate.getFullYear();
    if (!education.every(edu => validateYear(edu.passing_year))) {
      console.warn('Validation Error: Education passing year greater than current year', { education });
      return NextResponse.json({ message: 'Passing year cannot be greater than the current year.' }, { status: 400 });
    }
    if (!career.every(car => validateYear(car.joining_year) && (!car.leaving_year || validateYear(car.leaving_year)))) {
      console.warn('Validation Error: Career joining or leaving year greater than current year', { career });
      return NextResponse.json({ message: 'Joining year and leaving year cannot be greater than the current year.' }, { status: 400 });
    }

    // Check for existing email, phone, ID number, and passport number
    const emailCheckResult = await query('SELECT id FROM member WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      console.warn('Validation Error: Email already exists', { email });
      logger.warn('Validation Error: Email already exists', { email });
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }
    const phoneCheckResult = await query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      console.warn('Validation Error: Phone number already exists', { phone });
      logger.warn('Validation Error: Phone number already exists', { phone });
      return NextResponse.json({ message: 'Phone Number already exists' }, { status: 400 });
    }
    const idNumberCheckResult = await query('SELECT id FROM member WHERE id = $1', [idNumber]);
    if (idNumberCheckResult.rows.length > 0) {
      console.warn('Validation Error: ID number already exists', { idNumber });
      logger.warn('Validation Error: ID number already exists', { idNumber });
      return NextResponse.json({ message: 'ID number already exists' }, { status: 400 });
    }
    const passportNumberCheckResult = await query('SELECT id FROM member WHERE passport_number = $1', [passport_number]);
    if (passportNumberCheckResult.rows.length > 0) {
      console.warn('Validation Error: Passport number already exists', { passport_number });
      logger.warn('Validation Error: Passport number already exists', { passport_number });
      return NextResponse.json({ message: 'Passport number already exists' }, { status: 400 });
    }

    const phdCandidateId = await generatePhdCandidateId();
    console.log('Generated PhD Candidate ID:', phdCandidateId);

    // Save profile photo
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      try {
        photoUrl = await saveProfilePhoto(photoFile, phdCandidateId);
        console.log('Profile photo URL:', photoUrl);
      } catch (error) {
        console.error('Error saving profile photo:', error.message);
        return NextResponse.json({ message: `Failed to save profile photo: ${error.message}` }, { status: 500 });
      }
    }

    // Save document photos
    const documentUrls = [];
    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const documentFile = documents[i].documentPhoto;
        if (documentFile) {
          try {
            const documentUrl = await saveDocumentPhoto(documentFile, phdCandidateId, i, documents[i].documentType);
            documentUrls.push(documentUrl);
            console.log(`Document photo URL for document ${i}:`, documentUrl);
          } catch (error) {
            console.error('Error saving document photo:', error.message);
            return NextResponse.json({ message: `Failed to save document photo: ${error.message}` }, { status: 500 });
          }
        } else {
          console.warn('Document photo is missing for document:', documents[i]);
          return NextResponse.json({ message: 'PhD Candidate document photo is missing' }, { status: 400 });
        }
      }
    }

    try {
      await query('BEGIN');
      console.log('Database transaction started');

      const insertPhdCandidateQuery = `
        INSERT INTO phd_candidate_basic_info 
        (id, first_name, last_name, phone, gender, "bloodGroup", country, dob, email, password, short_bio, admission_date, completion_date, photo, status, type, passport_number)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Active', $15, $16)
        RETURNING *;
      `;

      await query(insertPhdCandidateQuery, [
        phdCandidateId,
        first_name,
        last_name,
        phone,
        gender,
        bloodGroup,
        country,
        dob,
        email,
        password,
        short_bio,
        admission_date,
        completion_date,
        photoUrl,
        type,
        passport_number
      ]);

      console.log('Inserted into phd_candidate_basic_info');


      // Insert into phd_candidate_socialmedia_info
      const insertSocialMediaQuery = `INSERT INTO phd_candidate_socialmedia_info (phd_candidate_id, socialMedia_name, link) VALUES ($1, $2, $3) RETURNING *;`;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [phdCandidateId, sm.socialMedia_name, sm.link]);
      }
      console.log('Inserted into phd_candidate_socialmedia_info');

      const insertMemberQuery = `
              INSERT INTO member 
              (id, first_name, last_name, phone, gender, "bloodGroup", country, dob, passport_number, email, password, short_bio, joining_date, leaving_date, photo, status, type)
              VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Active', $16)
              RETURNING *;
            `;
      await query(insertMemberQuery, [
          phdCandidateId,  
          first_name,      
          last_name,       
          phone,           
          gender,          
          bloodGroup,      
          country,         
          dob,             
          passport_number, 
          email,           
          password,        
          short_bio,       
          admission_date,  
          completion_date,  // Insert completion_date into leaving_date
          photoUrl,         
          type             
      ]);

      console.log('Inserted into member');

      // Insert into phd_candidate_education_info
      const insertEducationQuery = `INSERT INTO phd_candidate_education_info (phd_candidate_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        await query(insertEducationQuery, [phdCandidateId, edu.degree, edu.institution, edu.passing_year]);
      }
      console.log('Inserted into phd_candidate_education_info');

      // Insert into phd_candidate_career_info
      const insertCareerQuery = `INSERT INTO phd_candidate_career_info (phd_candidate_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        await query(insertCareerQuery, [phdCandidateId, car.position, car.organization_name, car.joining_year, car.leaving_year]);
      }
      console.log('Inserted into phd_candidate_career_info');

      // Insert into phd_candidate_documents_info
      const insertDocumentsQuery = `INSERT INTO phd_candidate_document_info ("phd_candidate_id", "title", "documentType", "document_photo") VALUES ($1, $2, $3, $4) RETURNING *;`;

        for (let i = 0; i < documents.length; i++) {
          const document = documents[i];
          const documentUrl = documentUrls[i]; // Get the URL of the saved document photo

          if (!documentUrl) {
            throw new Error('Document URL is null');
          }

          await query(insertDocumentsQuery, [
            phdCandidateId, document.title, documentUrl, document.documentType,
          ]);
        }
        console.log('Inserted into phd_candidate_document_info');

        const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
        const Id = `${phdCandidateId}`; 
        const notificationTitle = `A New PhD Candidate Added [${phdCandidateId}] By ${adminEmail}`;
        const notificationStatus = 'Unread';
        await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      await query('COMMIT');
      console.log('Database transaction committed');

      // Send Telegram alert for success
      const alertMessage = formatAlertMessage('PhD Candidate Added', `A new PhD Candidate with ID ${phdCandidateId} was successfully added.`);
      sendTelegramAlert(alertMessage);
      console.log('Success alert sent via Telegram');

      // Return success response
      logger.info(`PhD Candidate Added: ${phdCandidateId}`, { sessionId, adminEmail });
      return NextResponse.json({ message: 'PhD Candidate information added successfully' }, { status: 200 });
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error in database transaction:', error.message);
      sendTelegramAlert(formatAlertMessage('Error Adding PhD Candidate', `Error adding PhD Candidate: ${error.message}`));
      return NextResponse.json({ message: `Error adding PhD Candidate: ${error.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in API request:', error.message);
    sendTelegramAlert(formatAlertMessage('Error Handling PhD Candidate Request', `Error: ${error.message}`));
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}