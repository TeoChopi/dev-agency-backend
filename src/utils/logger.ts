import pino from 'pino';
import { config } from '../config/config';

/**
 * Logger configuration
 */
const loggerConfig: pino.LoggerOptions = {
  level: config.logLevel,
  transport: config.nodeEnv === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: config.nodeEnv,
  },
};

/**
 * Create logger instance
 */
export const logger = pino(loggerConfig);

/**
 * Create child logger with additional context
 */
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};