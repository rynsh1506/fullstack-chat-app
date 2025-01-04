import winston from "winston";

const { format } = winston;

// Konfigurasi logger
const log = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] [${level}] - ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default log;
