// app/api/check-auth/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const email = request.cookies.get('email');
  console.log('Cookie email:', email); // Log the email cookie value
  console.log('Request headers:', request.headers); // Log request headers for further inspection
  if (email) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}