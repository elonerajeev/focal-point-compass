import { createLogger, format, transports } from "winston";

const jsonFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  const entry = {
    timestamp,
    level,
    message,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };
  return JSON.stringify(entry);
});

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), jsonFormat),
  transports: [new transports.Console()],
});
