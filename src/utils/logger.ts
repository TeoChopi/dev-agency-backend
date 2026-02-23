import pino from 'pino';
import { env } from '../config/env';

const logLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = pino({
  level: logLevel,
  transport: env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});