import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment-timezone';

const customFormat = format.printf(({ timestamp, level, message, meta }) => {
  const { eid, sid, taskName, details } = meta;
  return `${timestamp}-EID[${eid || ''}]-SID[${sid || ''}]-[${level.toUpperCase()}] TASK[${taskName}]-${details}`;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: () => moment().tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss')
    }),
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