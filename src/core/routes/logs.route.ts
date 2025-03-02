import { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { validateDate } from '../../shared/libraries/utils/date-validator';
import { logger } from '../../shared/libraries/utils/logger';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';

/**
 * Logs Route
 * @description Logs Route
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 * @example
 * GET /api/logs
 * GET /api/logs/dates
 * GET /api/logs/level/:level
 * GET /api/logs/search
 */
const logsRoute = Router();

/**
 * Get Logs by Date
 * @route GET /api/logs
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {object} Response with logs content
 */
logsRoute.get('/', async (req: Request, res: Response) => {
  try {
    // Get date from query or use today's date
    const queryDate = req.query.date as string;
    const date = queryDate ? new Date(queryDate) : new Date();

    // Validate date
    if (queryDate && !validateDate(queryDate)) {
      ResponseHandler.badRequest(res, 'Invalid date format. Use YYYY-MM-DD');
    }

    // Format date for folder name
    const folderName = date.toISOString().split('T')[0];
    const logsDir = path.join(process.cwd(), 'logs', folderName);
    const logFile = path.join(logsDir, 'logs.log');

    try {
      // Check if directory exists
      await fs.access(logsDir);
    } catch (error) {
      ResponseHandler.notFound(res, `No logs found for date: ${folderName}`);
    }

    // Read log file
    const logContent = await fs.readFile(logFile, 'utf-8');
    const logs = logContent
      .split('\n')
      .filter(Boolean) // Remove empty lines
      .map((line) => {
        try {
          // Parse log line into structured format
          const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
          if (match) {
            return {
              timestamp: match[1],
              level: match[2],
              message: match[3],
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean); // Remove null entries

    ResponseHandler.success(res, {
      date: folderName,
      total: logs.length,
      logs,
    });
  } catch (error) {
    logger.error(`Error retrieving logs: ${error}`);
    ResponseHandler.error(res, 'Failed to retrieve logs');
  }
});

/**
 * Get Available Log Dates
 * @route GET /api/logs/dates
 * @returns {object} Response with available log dates
 */
logsRoute.get('/dates', async (req: Request, res: Response) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const dates = await fs.readdir(logsDir);

    // Filter valid date folders and sort them
    const validDates = dates
      .filter((date) => validateDate(date))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    ResponseHandler.success(res, {
      total: validDates.length,
      dates: validDates,
    });
  } catch (error) {
    logger.error(`Error retrieving log dates: ${error}`);
    ResponseHandler.error(res, 'Failed to retrieve log dates');
  }
});

/**
 * Get Logs by Level
 * @route GET /api/logs/level/:level
 * @param {string} level - Log level (ERROR, WARNING, INFO, SUCCESS)
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @returns {object} Response with filtered logs
 */
logsRoute.get('/level/:level', async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const queryDate = req.query.date as string;
    const date = queryDate ? new Date(queryDate) : new Date();

    // Validate level
    const validLevels = ['ERROR', 'WARNING', 'INFO', 'SUCCESS'];
    if (!validLevels.includes(level.toUpperCase())) {
      ResponseHandler.badRequest(res, 'Invalid log level');
    }

    // Validate date
    if (queryDate && !validateDate(queryDate)) {
      ResponseHandler.badRequest(res, 'Invalid date format. Use YYYY-MM-DD');
    }

    const folderName = date.toISOString().split('T')[0];
    const logFile = path.join(process.cwd(), 'logs', folderName, 'logs.log');

    const logContent = await fs.readFile(logFile, 'utf-8');
    const logs = logContent
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
        if (match && match[2].toUpperCase() === level.toUpperCase()) {
          return {
            timestamp: match[1],
            level: match[2],
            message: match[3],
          };
        }
        return null;
      })
      .filter(Boolean);

    ResponseHandler.success(res, {
      date: folderName,
      level: level.toUpperCase(),
      total: logs.length,
      logs,
    });
  } catch (error) {
    logger.error(`Error retrieving logs by level: ${error}`);
    ResponseHandler.error(res, 'Failed to retrieve logs');
  }
});

/**
 * Search Logs
 * @route GET /api/logs/search
 * @param {string} query - Search query
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @returns {object} Response with matched logs
 */
logsRoute.get('/search', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.query as string;
    const queryDate = req.query.date as string;

    const date = queryDate ? new Date(queryDate) : new Date();
    if (queryDate && !validateDate(queryDate)) {
      ResponseHandler.badRequest(res, 'Invalid date format. Use YYYY-MM-DD');
    }

    const folderName = date.toISOString().split('T')[0];
    const logFile = path.join(process.cwd(), 'logs', folderName, 'logs.log');

    const logContent = await fs.readFile(logFile, 'utf-8');
    const logs = logContent
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
        if (searchQuery) {
          if (match && line.toLowerCase().includes(searchQuery.toLowerCase())) {
            return {
              timestamp: match[1],
              level: match[2],
              message: match[3],
            };
          }
        } else {
          if (match) {
            return {
              timestamp: match[1],
              level: match[2],
              message: match[3],
            };
          }
        }
        return null;
      })
      .filter(Boolean);

    ResponseHandler.success(res, {
      date: folderName,
      query: searchQuery,
      total: logs.length,
      logs,
    });
  } catch (error) {
    logger.error(`Error searching logs: ${error}`);
    ResponseHandler.error(res, 'Failed to search logs');
  }
});

export default logsRoute;
