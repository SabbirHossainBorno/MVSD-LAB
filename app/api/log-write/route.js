// app/api/log-write/route.js
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getDbConnection } from '../../lib/db'; // Adjust path based on your project structure
import { v4 as uuidv4 } from 'uuid';

// Function to format log entry
const formatLog = (eid, sid, task, details, status) => {
  const timeZone = 'America/Toronto'; // Canada Time
  const zonedDate = toZonedTime(new Date(), timeZone);
  const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });
  return `${formattedDate}-EID[${eid || 'EMPTY'}]-SID[${sid}]-[${status}] TASK[${task}] - ${JSON.stringify(details)}\n`;
};

export async function POST(request) {
  const { eid, sid, task, details, status } = await request.json();

  // Prepare log entry
  const logEntry = formatLog(eid, sid, task, details, status);

  // Save to database or file (based on your architecture)
  try {
    const client = await getDbConnection().connect();
    await client.query('INSERT INTO logs (log_entry) VALUES ($1)', [logEntry]);
    client.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error while writing log:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}