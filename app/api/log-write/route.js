// app/api/log-write/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Correct log file path
const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log'); // Correct log file location

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

  // Write to log file
  try {
    fs.appendFileSync(logFilePath, logEntry); // Append log entry to the file
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error while writing log:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// Export sendLogWrite function so it can be used elsewhere
export const sendLogWrite = POST;
