import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to generate the next Professor ID in the format P01MVSD
const generateProfessorId = async () => {
  const client = await pool.connect();
  try {
    console.log('Generating Professor ID...');
    
    // Fetch the maximum ID from the table
    const result = await client.query('SELECT MAX(id) AS max_id FROM professor_basic_info');
    
    // Extract the numeric part of the existing ID and increment
    const maxId = result.rows[0].max_id || 'P00MVSD';  // Default to 'P00MVSD' if none exist
    const numericPart = parseInt(maxId.substring(1, 3)) || 0; // Extract the '01' part
    const nextId = numericPart + 1;

    // Ensure the next ID is formatted as PXXMVSD
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
  console.log('Attempting to save file...');
  const filename = index !== null ? `${professorId}_Award_${index}${path.extname(file.name)}` : `${professorId}_${type}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/Storage/Images/Professor', filename);

  console.log(`Saving file to: ${targetPath}`);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer)); // Save file to target directory
    console.log('File saved successfully:', filename);
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error(`Failed to save file: ${error.message}`);
  }

  return `/home/mvsd-lab/Storage/Images/Professor/${filename}`; // Return the URL to be stored in the database
};

export async function POST(req) {
  const client = await pool.connect();
  try {
    console.log('Receiving form data...');
    const formData = await req.formData();

    console.log('Form data received:', formData);

    // Extract basic info
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

    // Handle file uploads
    const photoFile = formData.get('photo');
    const awards = [];
    const awardFiles = [];

    console.log('Processing awards and award files...');
    for (const [key, value] of formData.entries()) {
      console.log(`Processing entry - Key: ${key}, Value: ${value}`);

      // Ensure the key is related to awards
      if (key.startsWith('awards[')) {
        const index = key.match(/\d+/)[0]; // Extract the index number (e.g., awards[0])
        const field = key.match(/\[(.*?)\]/)[1]; // Extract the field (e.g., 'title', 'year', 'photo')

        // Initialize the award object at this index if it doesn't exist
        if (!awards[index]) awards[index] = {};

        if (field === 'photo' && value instanceof File) {
          console.log(`File detected for award ${index}:`, value);
          awardFiles[index] = value; // Collect the file for this award
        } else {
          awards[index][field] = value; // Collect the field data for this award
        }
      }
    }

    console.log('Awards:', awards);
    console.log('Award files:', awardFiles);

    // Check if email already exists in member table
    console.log('Checking if email exists in member table...');
    const emailCheckQuery = 'SELECT id FROM member WHERE email = $1';
    const emailCheckResult = await client.query(emailCheckQuery, [email]);

    if (emailCheckResult.rows.length > 0) {
      console.warn('Email already exists in the member table:', email);
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    // Check if phone already exists in member table
    console.log('Checking if phone exists in member table...');
    const phoneCheckQuery = 'SELECT id FROM member WHERE phone = $1';
    const phoneCheckResult = await client.query(phoneCheckQuery, [phone]);

    if (phoneCheckResult.rows.length > 0) {
      console.warn('Phone Number already exists in the member table:', phone);
      return NextResponse.json({ message: 'Phone Number already exists' }, { status: 400 });
    }

    // Generate Professor ID
    const professorId = await generateProfessorId();
    console.log('Generated Professor ID:', professorId);

    // Save profile photo
    let photoUrl = null;
    if (photoFile) {
      try {
        console.log('Saving profile photo...');
        photoUrl = await saveFile(photoFile, professorId, 'DP');
        console.log('Profile photo saved as:', photoUrl);
      } catch (error) {
        console.error('Error saving profile photo:', error);
        return NextResponse.json({ message: 'Error saving profile photo' }, { status: 500 });
      }
    } else {
      console.warn('No profile photo uploaded');
    }

    // Save award files
    const awardUrls = [];
    for (let i = 0; i < awardFiles.length; i++) {
      const awardFile = awardFiles[i];
      if (awardFile) {
        try {
          console.log('Saving award photo...');
          const awardUrl = await saveFile(awardFile, professorId, 'AWARD', i + 1);
          awardUrls.push(awardUrl);
          console.log('Award photo saved as:', awardUrl);
        } catch (error) {
          console.error('Error saving award photo:', error);
          return NextResponse.json({ message: 'Error saving award photo' }, { status: 500 });
        }
      } else {
        awardUrls.push(null);
      }
    }

    // Print award URLs to console
    console.log('Award URLs:', awardUrls);

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Insert into professor_basic_info
      const insertProfessorQuery = `
        INSERT INTO professor_basic_info 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;

      const professorResult = await client.query(insertProfessorQuery, [
        professorId,
        first_name,
        last_name,
        phone || null,
        dob || null,
        email,
        password,
        short_bio || null,
        joining_date,
        leaving_date || null,
        photoUrl || null,
        type,
      ]);

      console.log('Inserted professor_basic_info:', professorResult.rows[0]);

      // Insert into member table
      const insertMemberQuery = `
        INSERT INTO member 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;

      const memberResult = await client.query(insertMemberQuery, [
        professorId,
        first_name,
        last_name,
        phone || null,
        dob || null,
        email,
        password,
        short_bio || null,
        joining_date,
        leaving_date || null,
        photoUrl || null,
        type,
      ]);

      console.log('Inserted member:', memberResult.rows[0]);

      // Handle education info
      const insertEducationQuery = `
        INSERT INTO professor_education_info (professor_id, degree, institution, passing_year)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      for (const edu of education) {
        console.log('Inserting education:', edu);
        const passingYear = parseInt(edu.passing_year, 10);
        await client.query(insertEducationQuery, [
          professorId,
          edu.degree,
          edu.institution,
          passingYear,
        ]);
      }

      // Handle career info
      const insertCareerQuery = `
        INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      for (const car of career) {
        console.log('Inserting career info:', car);
        const joiningYear = parseInt(car.joining_year, 10);
        const leavingYear = car.leaving_year ? parseInt(car.leaving_year, 10) : null;
        const organizationName = car.organization || null;
        await client.query(insertCareerQuery, [
          professorId,
          car.position,
          organizationName,
          joiningYear,
          leavingYear,
        ]);
      }

      // Handle citation info
      const insertCitationQuery = `
        INSERT INTO professor_citations_info (professor_id, title, link, organization_name)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      for (const citation of citations) {
        console.log('Inserting citation:', citation);
        const organizationName = citation.organization || null;
        await client.query(insertCitationQuery, [
          professorId,
          citation.title,
          citation.link,
          organizationName,
        ]);
      }

      // Handle award info
      const insertAwardQuery = `
        INSERT INTO professor_award_info (professor_id, title, year, details, award_photo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        const photoUrl = awardUrls[i] || null;

        console.log('Inserting award:', award);
        const year = parseInt(award.year, 10);

        if (!award.year) {
          console.error(`Invalid year in award data for award ${i}:`, award);
          return NextResponse.json({ message: 'Invalid year in award data' }, { status: 400 });
        }

        await client.query(insertAwardQuery, [
          professorId,
          award.title,
          year,
          award.details || null,
          photoUrl,
        ]);
      }

      // Commit the transaction
      await client.query('COMMIT');

      return NextResponse.json({ message: 'Professor added successfully', professorId });

    } catch (insertError) {
      // Rollback the transaction in case of an error
      await client.query('ROLLBACK');
      console.error('Error during transaction:', insertError);
      return NextResponse.json({ message: 'Failed to insert data', error: insertError.message }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
