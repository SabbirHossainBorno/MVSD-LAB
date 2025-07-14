import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    // Path to your video directory
    const videoDir = path.join(
      process.cwd(), 
      'public', 
      'Storage', 
      'Course', 
      courseId, 
      'playlist'
    );

    // Read video files
    const files = fs.readdirSync(videoDir);
    const videos = files
      .filter(file => ['.mp4', '.mov', '.avi'].includes(path.extname(file).toLowerCase()))
      .map(file => ({
        id: path.parse(file).name,
        title: path.parse(file).name.replace(/_/g, ' '),
        filename: file,
        url: `/Storage/Course/${courseId}/playlist/${file}`,
        thumbnail: `/images/video-thumbnails/${path.parse(file).name}.jpg` // You'll need to create these
      }));

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load videos', details: error.message },
      { status: 500 }
    );
  }
}