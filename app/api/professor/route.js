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

// Helper function to save a file
const saveFile = async (file, professorId, type, index = null) => {
  const filename = index !== null ? `${professorId}_Award_${index}${path.extname(file.name)}` : `${professorId}_${type}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/Storage/Images/Professor', filename);

  try {
    console.log(`Saving file: ${filename} to ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`File saved successfully at: ${targetPath}`);
    return `/home/mvsd-lab/Storage/Images/Professor/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error(`Failed to save file: ${error.message}`);
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
    const awards = JSON.parse(formData.get('awards') || '[]');

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
      photoUrl = await saveFile(photoFile, professorId, 'DP');
      console.log(`Profile photo URL: ${photoUrl}`);
    }

    // Save award photos if awards exist
    const awardUrls = [];
    if (awards.length > 0) {
      for (let i = 0; i < awards.length; i++) {
        const awardFile = formData.get(`award_photo_${i}`);
        if (awardFile) {
          const awardUrl = await saveFile(awardFile, professorId, `Award_${i + 1}`);
          console.log(`Saved award photo ${i + 1}: ${awardUrl}`);
          awardUrls.push(awardUrl);
        } else {
          awardUrls.push(null);
        }
      }
    }

    // Begin transaction
    await client.query('BEGIN');
    console.log('Transaction started...');

    try {
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
          professorId, car.position, car.organization, parseInt(car.joining_year), car.leaving_year ? parseInt(car.leaving_year) : null,
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

      // Insert award info if awards exist
      if (awards.length > 0) {
        console.log('Inserting award info...');
        const insertAwardQuery = `INSERT INTO professor_awards_info (professor_id, award, award_photo) VALUES ($1, $2, $3) RETURNING *;`;
        for (let i = 0; i < awards.length; i++) {
          await client.query(insertAwardQuery, [professorId, awards[i].award_name, awardUrls[i] || null]);
          console.log(`Award info inserted for award ${i + 1}`);
        }
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully.');
      return NextResponse.json({ message: 'Professor info inserted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during transaction:', error);
      return NextResponse.json({ message: 'Error inserting professor info', error: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
