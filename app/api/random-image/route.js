import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public/images/login_banner');
  const files = fs.readdirSync(imagesDir);
  const randomImage = files[Math.floor(Math.random() * files.length)];
  const imageUrl = `/images/login_banner/${randomImage}`;
  return NextResponse.json({ imageUrl });
}

