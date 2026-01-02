const winston = require("winston");
const path = require("path");

const logFormat = winston.format.combine(
  winston.format.colorize(), // add colors
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message} - ${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: "info", // default level
  format: logFormat,
  transports: [
    new winston.transports.Console(), // logs to console
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/rejections.log"),
    }),
  ],
});

module.exports = logger;
