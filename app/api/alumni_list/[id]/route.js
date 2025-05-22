// app/api/alumni_list/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request) {
  const url = new URL(request.url);
  let id = '';
  
  try {
    console.log('🔵 API Request Received:', url.pathname);
    
    // Extract ID from URL path
    const pathSegments = url.pathname.split('/');
    id = pathSegments[pathSegments.length - 1];
    console.log('🆔 Extracted ID:', id);

    // Validate ID format
    if (!/^PHDC\d{2}MVSD$/.test(id)) {
      console.log('❌ Invalid ID Format:', id);
      return NextResponse.json(
        { success: false, message: 'Invalid alumni ID format' },
        { status: 400 }
      );
    }

    console.log('🔍 Executing Database Query for ID:', id);
    
    const detailQuery = `
      SELECT 
        b.*,
        COALESCE(json_agg(DISTINCT s) FILTER (WHERE s.phd_candidate_id IS NOT NULL), '[]') AS social_media,
        COALESCE(json_agg(DISTINCT e) FILTER (WHERE e.phd_candidate_id IS NOT NULL), '[]') AS education,
        COALESCE(json_agg(DISTINCT c) FILTER (WHERE c.phd_candidate_id IS NOT NULL), '[]') AS career
      FROM phd_candidate_basic_info b
      LEFT JOIN phd_candidate_socialmedia_info s ON b.id = s.phd_candidate_id
      LEFT JOIN phd_candidate_education_info e ON b.id = e.phd_candidate_id
      LEFT JOIN phd_candidate_career_info c ON b.id = c.phd_candidate_id
      WHERE b.id = $1
      GROUP BY b.id
    `;

    const result = await query(detailQuery, [id]);
    console.log('📊 Database Query Result:', {
      rowCount: result.rowCount,
      rows: result.rows.length > 0 ? 'Data Found' : 'No Data'
    });

    if (result.rows.length === 0) {
      console.log('❌ No Alumni Found for ID:', id);
      return NextResponse.json(
        { success: false, message: 'Alumni not found' },
        { status: 404 }
      );
    }

    const rawData = result.rows[0];
    console.log('📦 Raw Database Response:', {
      id: rawData.id,
      social_media: rawData.social_media?.length || 0,
      education: rawData.education?.length || 0,
      career: rawData.career?.length || 0
    });

    // Transform data for frontend
    const transformed = {
      id: rawData.id,
      firstName: rawData.first_name,
      lastName: rawData.last_name,
      email: rawData.email,
      phone: rawData.phone,
      completionDate: new Date(rawData.completion_date).toISOString(),
      photo: rawData.photo,
      socialMedia: rawData.social_media?.map(sm => ({
        name: sm.socialmedia_name,
        link: sm.link
      })) || [],
      education: rawData.education?.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        passingYear: edu.passing_year
      })) || [],
      career: rawData.career?.map(job => ({
        position: job.position,
        organization: job.organization_name,
        joiningYear: job.joining_year,
        leavingYear: job.leaving_year
      })) || []
    };

    console.log('🔄 Transformed Data:', {
      id: transformed.id,
      socialMediaCount: transformed.socialMedia.length,
      educationCount: transformed.education.length,
      careerCount: transformed.career.length
    });

    console.log('✅ Successfully Processed Request for ID:', id);
    return NextResponse.json({
      success: true,
      alumni: transformed
    });

  } catch (error) {
    console.error('‼️ Error Processing Request:', {
      id,
      errorMessage: error.message,
      errorStack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        errorDetails: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}