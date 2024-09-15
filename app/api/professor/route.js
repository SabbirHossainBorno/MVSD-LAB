import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { format } from 'date-fns-tz';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logFilePath = '/home/mvsd-lab/Log/mvsd_lab.log';

// Helper function to write logs to the log file
const writeLog = (message) => {
  const timeZone = 'Asia/Dhaka'; // Bangladesh Standard Time (BST)
  const logMessage = `${format(new Date(), 'yyyy-MM-dd HH:mm:ssXXX', { timeZone })} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

// Helper function to send a Telegram alert
const sendTelegramAlert = async (message) => {
  const apiKey = '7489554804:AAFZs1eZmjZ8H634tBPhtL54UsLZOi3vCxg';
  const groupId = '-4285248556';
  const url = `https://api.telegram.org/bot${apiKey}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: groupId,
      text: message,
    });
    writeLog('Telegram alert sent successfully');
  } catch (error) {
    writeLog(`Failed to send Telegram alert: ${error.message}`);
  }
};

// Helper function to generate the next Professor ID
const generateProfessorId = async () => {
  const client = await pool.connect();
  try {
    writeLog('Initiating Professor ID generation...');
    const result = await client.query('SELECT MAX(id) AS max_id FROM professor_basic_info');
    const maxId = result.rows[0]?.max_id || 'P00MVSD';
    const numericPart = parseInt(maxId.substring(1, 3), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `P${String(nextId).padStart(2, '0')}MVSD`;
    writeLog(`Professor ID generated successfully: ${formattedId}`);
    return formattedId;
  } catch (error) {
    writeLog(`Error occurred during Professor ID generation: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
};

// Helper function to save profile photo
const saveProfilePhoto = async (file, professorId) => {
  const filename = `${professorId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/Storage/Images/Professor', filename);

  try {
    writeLog(`Saving profile photo with filename: ${filename} at path: ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    writeLog(`Profile photo saved successfully at path: ${targetPath}`);
    return `/home/mvsd-lab/Storage/Images/Professor/${filename}`;
  } catch (error) {
    writeLog(`Error occurred while saving profile photo: ${error.message}`);
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

// Helper function to save award photo
const saveAwardPhoto = async (file, professorId, index) => {
  const filename = `${professorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/Storage/Images/Professor', filename);

  try {
    writeLog(`Saving award photo with filename: ${filename} at path: ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    writeLog(`Award photo saved successfully at path: ${targetPath}`);
    return `/home/mvsd-lab/Storage/Images/Professor/${filename}`;
  } catch (error) {
    writeLog(`Error occurred while saving award photo: ${error.message}`);
    throw new Error(`Failed to save award photo: ${error.message}`);
  }
};

// Main function to handle the POST request
export async function POST(req) {
  const client = await pool.connect();
  try {
    writeLog('Receiving form data...');
    const formData = await req.formData();

    // Extract form data
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const dob = formData.get('dob');
    const email = formData.get('email');
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const joining_date = formData.get('joining_date');
    const leaving_date = formData.get('leaving_date') || null;
    const type = formData.get('type') || 'Professor';
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const citations = JSON.parse(formData.get('citations') || '[]');
    const awards = [];
    for (let i = 0; formData.has(`awards[${i}][title]`); i++) {
      awards.push({
        title: formData.get(`awards[${i}][title]`),
        year: formData.get(`awards[${i}][year]`),
        details: formData.get(`awards[${i}][details]`),
        awardPhoto: formData.get(`awards[${i}][awardPhoto]`)
      });
    }

    // Check if email or phone already exists
    writeLog(`Checking if email (${email}) or phone (${phone}) already exists in the database...`);
    const emailCheckResult = await client.query('SELECT id FROM member WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      writeLog(`Email already exists in the database: ${email}`);
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const phoneCheckResult = await client.query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      writeLog(`Phone number already exists in the database: ${phone}`);
      return NextResponse.json({ message: 'Phone Number already exists' }, { status: 400 });
    }

    const professorId = await generateProfessorId();
    writeLog(`New Professor ID generated: ${professorId}`);

    // Save profile photo if available
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      photoUrl = await saveProfilePhoto(photoFile, professorId);
      writeLog(`Profile photo URL generated successfully: ${photoUrl}`);
    }

    // Handle awards processing
    const awardUrls = [];
    if (awards.length > 0) {
      for (let i = 0; i < awards.length; i++) {
        const awardFile = awards[i].awardPhoto;
        if (awardFile) {
          const awardUrl = await saveAwardPhoto(awardFile, professorId, i + 1);
          awardUrls.push(awardUrl);
        } else {
          writeLog(`Award photo is missing for award: ${awards[i].title}`);
          throw new Error('Award photo is missing');
        }
      }
    }

    try {
      // Begin Execution
      await client.query('BEGIN');
      writeLog('A New Professor Adding Process Execution Started...');

      // Insert professor info
      const insertProfessorQuery = `
        INSERT INTO professor_basic_info 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;
      const professorInsertResult = await client.query(insertProfessorQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type,
      ]);
      writeLog('Professor information inserted successfully.');

      // Insert member info
      const insertMemberQuery = `
        INSERT INTO member 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;
      const memberInsertResult = await client.query(insertMemberQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type,
      ]);
      writeLog('Member information inserted successfully.');

      // Insert education info
      const insertEducationQuery = `INSERT INTO professor_education_info (professor_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        const eduInsertResult = await client.query(insertEducationQuery, [professorId, edu.degree, edu.institution, parseInt(edu.passing_year)]);
        writeLog('Education information inserted successfully.');
      }

      // Insert career info
      const insertCareerQuery = `INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        const carInsertResult = await client.query(insertCareerQuery, [
          professorId, car.position, car.organization, parseInt(car.joining_year), parseInt(car.leaving_year),
        ]);
        writeLog('Career information inserted successfully.');
      }

      // Insert citation info
      const insertCitationQuery = `INSERT INTO professor_citations_info (professor_id, title, link, organization_name) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const citation of citations) {
        const citationInsertResult = await client.query(insertCitationQuery, [professorId, citation.title, citation.link, citation.organization]);
        writeLog('Citation information inserted successfully.');
      }

      // Insert awards info
      const insertAwardsQuery = `INSERT INTO professor_award_info (professor_id, title, year, details, award_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        const awardUrl = awardUrls[i]; // Get the URL of the saved award photo

        if (!awardUrl) {
          writeLog(`Award URL is null for award: ${award.title}`);
          throw new Error('Award URL is null');
        }

        try {
          const awardInsertResult = await client.query(insertAwardsQuery, [
            professorId, award.title, parseInt(award.year), award.details, awardUrl,
          ]);

          // Log all the award data
          writeLog('Award information inserted successfully.');

        } catch (error) {
          writeLog(`Error inserting award information for award: ${award.title}, Error: ${error.message}`);
          throw error; // Throw error to trigger rollback
        }
      }

      // Insert notification
      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${professorId}`; 
      const notificationTitle = `A New Professor Added [${professorId}]`;
      const notificationStatus = 'Unread';
      const notificationInsertResult = await client.query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);
      writeLog('Notification inserted successfully.');

      // Commit Execution
      await client.query('COMMIT');
      writeLog('Execution committed successfully.');
      writeLog(`A New Professor Added Successfully ID : ${professorId}`);
      sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nA New Professor Added.\nID : ${professorId}`);
      return NextResponse.json({ message: 'Professor information added successfully!' }, { status: 200 });

    } catch (error) {
      writeLog(`Error during execution: ${error.message}`);
      await client.query('ROLLBACK');
      return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    writeLog(`Error processing form data: ${error.message}`);
    return NextResponse.json({ message: `Failed to process form data: ${error.message}` }, { status: 500 });
  } finally {
    client.release();
  }
}
