// app/api/professor_list/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req) {
  const client = await pool.connect();
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const resultsPerPage = 10;
    const offset = (page - 1) * resultsPerPage;

    const searchQuery = `
      SELECT * FROM professor_basic_info
      WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM professor_basic_info
      WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
    `;

    const searchValue = `%${search}%`;
    const professorsResult = await client.query(searchQuery, [searchValue, resultsPerPage, offset]);
    const countResult = await client.query(countQuery, [searchValue]);

    const totalProfessors = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalProfessors / resultsPerPage);

    return NextResponse.json({
      professors: professorsResult.rows,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json({ message: 'Error fetching professors' }, { status: 500 });
  } finally {
    client.release();
  }
}
