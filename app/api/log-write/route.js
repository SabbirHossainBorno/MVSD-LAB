// app/api/log-write/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log');

const log = (message, eid, sid, status, taskName, details = {}) => {
  const timeZone = 'America/Toronto'; // Set to Canada time zone
  const zonedDate = toZonedTime(new Date(), timeZone);
  const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });

  const logMessage = `${formattedDate}-EID[${eid}]-SID[${sid}]-[${status}] TASK[${taskName}]-${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

export async function POST(request) {
  try {
    const { message, eid, sid, status, taskName, details } = await request.json();
    log(message, eid, sid, status, taskName, details);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in log-write API:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  }
}