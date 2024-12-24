// lib/logger.js

import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment-timezone';

const customFormat = format.printf(({ timestamp, level, message, meta = {} }) => {
  const { eid = '', sid = '', taskName = 'Unknown Task', details = 'No details provided' } = meta;
  return `${timestamp}-EID[${eid}]-SID[${sid}]-[${level.toUpperCase()}] TASK[${taskName}]-${details}`;
});

// Custom filter to exclude logs with "Unknown Task" and "No details provided"
const excludeUnknownTaskAndDetails = format((info) => {
  const { taskName, details } = info.meta || {};
  if (taskName === 'Unknown Task' && details === 'No details provided') {
    return false;
  }
  return info;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: () => moment().tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss')
    }),
    excludeUnknownTaskAndDetails(), // Apply the custom filter
    customFormat
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/mvsd-lab-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true, // Compress old log files
      utc: false // Use local time for log rotation
    })
  ],
  exceptionHandlers: [
    new transports.DailyRotateFile({
      filename: 'logs/mvsd-lab-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true, // Compress old log files
      utc: false // Use local time for log rotation
    })
  ]
});

export default logger;