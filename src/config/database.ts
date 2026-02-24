import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'info',
        },
      ],
    });

    this.setupEventListeners();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  private setupEventListeners(): void {
    this.prisma.$on('query', (e) => {
      logger.debug({
        query: e.query,
        params: e.params,
        duration: e.duration,
      }, 'Database query executed');
    });

    this.prisma.$on('error', (e) => {
      logger.error(e, 'Database error');
    });

    this.prisma.$on('warn', (e) => {
      logger.warn(e, 'Database warning');
    });

    this.prisma.$on('info', (e) => {
      logger.info(e, 'Database info');
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error(error, 'Failed to connect to database');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error(error, 'Failed to disconnect from database');
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error(error, 'Database health check failed');
      return false;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
export const prisma = databaseService.getClient();