import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to generate the next Professor ID
const generateProfessorId = async () => {
  const client = await pool.connect();
  try {
    console.log('Generating Professor ID...');
    const result = await client.query('SELECT MAX(id) AS max_id FROM professor_basic_info');
    const maxId = result.rows[0]?.max_id || 'P00MVSD';
    console.log(`Current Max Professor ID: ${maxId}`);
    const numericPart = parseInt(maxId.substring(1, 3), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `P${String(nextId).padStart(2, '0')}MVSD`;
    console.log('Generated Professor ID:', formattedId);
    return formattedId;
  } catch (error) {
    console.error('Error generating Professor ID:', error);
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
    console.log(`Saving profile photo: ${filename} to ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`Profile photo saved successfully at: ${targetPath}`);
    return `/home/mvsd-lab/Storage/Images/Professor/${filename}`;
  } catch (error) {
    console.error('Error saving profile photo:', error);
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

// Helper function to save award photo
const saveAwardPhoto = async (file, professorId, index) => {
  const filename = `${professorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/Storage/Images/Professor', filename);

  try {
    console.log(`Saving award photo: ${filename} to ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`Award photo saved successfully at: ${targetPath}`);
    return `/home/mvsd-lab/Storage/Images/Professor/${filename}`;
  } catch (error) {
    console.error('Error saving award photo:', error);
    throw new Error(`Failed to save award photo: ${error.message}`);
  }
};

// Main function to handle the POST request
export async function POST(req) {
  const client = await pool.connect();
  try {
    console.log('Receiving form data...');
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
    console.log('Parsed Awards Data:', awards);

    console.log('Received Form Data:', {
      first_name, last_name, phone, dob, email, short_bio, joining_date, leaving_date, type, education, career, citations, awards,
    });

    // Check if email or phone already exists
    console.log(`Checking if email (${email}) or phone (${phone}) already exists...`);
    const emailCheckResult = await client.query('SELECT id FROM member WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      console.log(`Email already exists: ${email}`);
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const phoneCheckResult = await client.query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      console.log(`Phone Number already exists: ${phone}`);
      return NextResponse.json({ message: 'Phone Number already exists' }, { status: 400 });
    }

    const professorId = await generateProfessorId();
    console.log(`New Professor ID: ${professorId}`);

    // Save profile photo if available
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      photoUrl = await saveProfilePhoto(photoFile, professorId);
      console.log(`Profile photo URL: ${photoUrl}`);
    }

   // Handle awards processing
const awardUrls = [];
if (awards.length > 0) {
  for (let i = 0; i < awards.length; i++) {
    const awardFile = formData.get(`award_photo_${i}`);
    console.log(`Processing award photo ${i}:`, awardFile); // Log the award file
    if (awardFile) {
      const awardUrl = await saveAwardPhoto(awardFile, professorId, i + 1);
      awardUrls.push(awardUrl);
    } else {
      awardUrls.push(null);
    }
  }
}
console.log('Award URLs:', awardUrls); // Log the award URLs






    try {
    // Begin transaction
    await client.query('BEGIN');
    console.log('Transaction started...');

    
      // Insert professor info
      console.log('Inserting professor basic info...');
      const insertProfessorQuery = `
        INSERT INTO professor_basic_info 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;
      const professorInsertResult = await client.query(insertProfessorQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type,
      ]);
      console.log('Professor info inserted:', professorInsertResult.rows[0]);

      // Insert member info
      console.log('Inserting member info...');
      const insertMemberQuery = `
        INSERT INTO member 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;
      const memberInsertResult = await client.query(insertMemberQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type,
      ]);
      console.log('Member info inserted:', memberInsertResult.rows[0]);

      // Insert education info
      console.log('Inserting education info...');
      const insertEducationQuery = `INSERT INTO professor_education_info (professor_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        const eduInsertResult = await client.query(insertEducationQuery, [professorId, edu.degree, edu.institution, parseInt(edu.passing_year)]);
        console.log('Education info inserted:', eduInsertResult.rows[0]);
      }

      // Insert career info
      console.log('Inserting career info...');
      const insertCareerQuery = `INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        const carInsertResult = await client.query(insertCareerQuery, [
          professorId, car.position, car.organization, parseInt(car.joining_year), parseInt(car.leaving_year),
        ]);
        console.log('Career info inserted:', carInsertResult.rows[0]);
      }

      // Insert citation info
      console.log('Inserting citation info...');
      const insertCitationQuery = `INSERT INTO professor_citations_info (professor_id, title, link, organization_name) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const citation of citations) {
        const citationInsertResult = await client.query(insertCitationQuery, [professorId, citation.title, citation.link, citation.organization]);
        console.log('Citation info inserted:', citationInsertResult.rows[0]);
      }

      // Insert awards info
console.log('Inserting awards info...');
const insertAwardsQuery = `INSERT INTO professor_award_info (professor_id, title, year, details, award_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
for (let i = 0; i < awards.length; i++) {
  const award = awards[i];
  const awardUrl = awardUrls[i]; // Get the URL of the saved award photo

  try {
    const awardInsertResult = await client.query(insertAwardsQuery, [
      professorId, award.title, parseInt(award.year), award.details, awardUrl,
    ]);

    // Log all the award data
    console.log('Award info inserted:', {
      id: awardInsertResult.rows[0].id, // Assuming ID is returned from the query
      professor_id: professorId,
      title: award.title,
      year: award.year,
      details: award.details,
      award_photo: awardUrl
    });

  } catch (error) {
    console.error('Error inserting award info:', {
      award,
      error: error.message
    });
    throw error; // Throw error to trigger rollback
  }
}


      // Commit transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully!');
      return NextResponse.json({ message: 'Professor info added successfully!' }, { status: 200 });

    } catch (error) {
      console.error('Error during transaction:', error);
      await client.query('ROLLBACK');
      return NextResponse.json({ message: `Transaction failed: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing form data:', error);
    return NextResponse.json({ message: `Failed to process form data: ${error.message}` }, { status: 500 });
  } finally {
    client.release();
  }
}
