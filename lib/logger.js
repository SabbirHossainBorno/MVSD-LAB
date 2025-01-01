// lib/logger.js
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import fs from 'fs';
import path from 'path';

// Custom formatter for log messages
const customFormat = format.printf(({ timestamp, level, message, meta = {} }) => {
  const { eid = '', sid = '', taskName = '', details = '' } = meta;
  return `${timestamp}-EID[${eid}]-SID[${sid}]-[${level.toUpperCase()}] TASK[${taskName}]-${details}`;
});

// Filter out logs with default or empty meta values
const excludeDefaultLogs = format((info) => {
  const { taskName = '', details = '' } = info.meta || {};
  if (!taskName || !details || taskName === 'Unknown Task' || details === 'No details provided') {
    return false; // Exclude this log entry
  }
  return info; // Include valid log entries
});

// Function to move the previous day's log file to the archive directory
const archivePreviousLogFile = () => {
  const logDir = path.join(__dirname, 'logs');
  const archiveDir = path.join(logDir, 'archive');
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const logFile = path.join(logDir, `mvsd-lab-${yesterday}.log`);
  const archiveFile = path.join(archiveDir, `mvsd-lab-${yesterday}.log`);

  if (fs.existsSync(logFile)) {
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }
    fs.renameSync(logFile, archiveFile);
  }
};

// Run the archive function at startup
archivePreviousLogFile();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: () => moment().tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss')
    }),
    excludeDefaultLogs(), // Apply the custom filter
    customFormat // Apply the formatter
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/mvsd-lab-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d', // Keep logs for 30 days
      zippedArchive: true, // Compress old log files
    })
  ],
  exceptionHandlers: [
    new transports.DailyRotateFile({
      filename: 'logs/mvsd-lab-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d', // Keep logs for 30 days
      zippedArchive: true, // Compress old log files
    })
  ]
});

export default logger;