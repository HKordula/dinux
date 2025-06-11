import fs from 'fs';
import path from 'path';

const logFile = path.resolve('access.log');

const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, body, query } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} (${duration}ms)\n` +
      (Object.keys(query).length ? `  Query: ${JSON.stringify(query)}\n` : '') +
      (Object.keys(body).length ? `  Body: ${JSON.stringify(body)}\n` : '');

    // write to console
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' // red
                  : res.statusCode >= 400 ? '\x1b[33m' // yellow
                  : '\x1b[32m'; // green
    const resetColor = '\x1b[0m';

    console.log(statusColor + logEntry.trim() + resetColor);

    // and append to file
    fs.appendFile(logFile, logEntry, err => {
      if (err) console.error('Failed to write log:', err);
    });
  });

  next();
};

export default logger;