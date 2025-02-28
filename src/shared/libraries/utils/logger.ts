import fs from 'fs';
import path from 'path';

/**
 * Enum for log levels.
 */
enum LogLevel {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

/**
 * Logger utility
 * @description A utility for logging messages with different levels and colors.
 * - Logs to console and file
 * - Colors and emojis for different levels
 * - Log directory is in the root of the project
 * - Log file is named logs.log and is in a folder named after the current date
 * - Logs are appended to the log file
 */
export class logger {
  private static enabledLevels: Set<LogLevel> = new Set(Object.values(LogLevel));
  private static logDirectory: string = path.join(process.cwd(), 'logs');

  /**
   * Initializes the logger by setting up the log directory and file.
   */
  private static initializeLogFile(): string {
    const date = new Date();
    const dateFolder = date.toISOString().split('T')[0]; // e.g., "2025-02-28"
    const logFolderPath = path.join(this.logDirectory, dateFolder);

    if (!fs.existsSync(logFolderPath)) {
      fs.mkdirSync(logFolderPath, { recursive: true });
    }

    const logFilePath = path.join(logFolderPath, 'logs.log');
    return logFilePath;
  }

  /**
   * Gets the color code for a given log level.
   * @param {LogLevel} level - The log level.
   * @returns {string} - The color code.
   */
  private static getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.SUCCESS:
        return '\x1b[32m'; // Green
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      case LogLevel.WARNING:
        return '\x1b[33m'; // Yellow
      case LogLevel.INFO:
        return '\x1b[34m'; // Blue
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      default:
        return '\x1b[0m'; // Reset
    }
  }

  /**
   * Gets the emoji for a given log level.
   * @param {LogLevel} level - The log level.
   * @returns {string} - The emoji.
   */
  private static getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.SUCCESS:
        return '✅';
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.WARNING:
        return '⚠️';
      case LogLevel.INFO:
        return 'ℹ️ ';
      case LogLevel.DEBUG:
        return '🐛';
      default:
        return '';
    }
  }

  /**
   * Logs a message with the specified log level.
   * @param {LogLevel} level - The log level.
   * @param {string} message - The message to log.
   */
  private static log(level: LogLevel, message: string): void {
    if (!this.enabledLevels.has(level)) return;

    const color = this.getColor(level);
    const emoji = this.getEmoji(level);
    const resetColor = '\x1b[0m';
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${emoji} ${message}`;

    console.log(`${color}${logMessage}${resetColor}`);

    const logFilePath = this.initializeLogFile();
    fs.appendFileSync(logFilePath, logMessage + '\n', 'utf8');
  }

  /**
   * Logs a success message.
   * @param {string} message - The message to log.
   */
  static success(message: string): void {
    this.log(LogLevel.SUCCESS, message);
  }

  /**
   * Logs an error message.
   * @param {string} message - The message to log.
   */
  static error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  /**
   * Logs a warning message.
   * @param {string} message - The message to log.
   */
  static warning(message: string): void {
    this.log(LogLevel.WARNING, message);
  }

  /**
   * Logs an info message.
   * @param {string} message - The message to log.
   */
  static info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Logs a debug message.
   * @param {string} message - The message to log.
   */
  static debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Enables logging for a specific level.
   * @param {LogLevel} level - The log level to enable.
   */
  static enableLevel(level: LogLevel): void {
    this.enabledLevels.add(level);
  }

  /**
   * Disables logging for a specific level.
   * @param {LogLevel} level - The log level to disable.
   */
  static disableLevel(level: LogLevel): void {
    this.enabledLevels.delete(level);
  }
}
