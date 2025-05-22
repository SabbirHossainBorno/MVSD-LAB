// app/api/alumni_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const page = parseInt(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const resultsPerPage = 12;
    const offset = (page - 1) * resultsPerPage;

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM phd_candidate_basic_info 
      WHERE alumni_status = 'Valid'
      AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;
    
    const dataQuery = `
      SELECT id, first_name, last_name, photo, 
        TO_CHAR(completion_date, 'YYYY-MM-DD') as completion_date,
        email, phone
      FROM phd_candidate_basic_info
      WHERE alumni_status = 'Valid'
      AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
      ORDER BY completion_date ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `;

    const [countResult, alumniData] = await Promise.all([
      query(countQuery, [`%${searchTerm}%`]),
      query(dataQuery, [`%${searchTerm}%`, resultsPerPage, offset])
    ]);

    const totalAlumni = Number(countResult.rows[0].total);
    
    return NextResponse.json({
      success: true,
      alumni: alumniData.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAlumni / resultsPerPage),
        totalAlumni
      }
    });

  } catch (error) {
    console.error('Alumni list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch alumni list' },
      { status: 500 }
    );
  }
}