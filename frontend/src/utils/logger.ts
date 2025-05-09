import axios from 'axios';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogData {
  level: LogLevel;
  message: string;
  details?: any;
  timestamp?: string;
}

class Logger {
  private static instance: Logger;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async log(level: LogLevel, message: string, details?: any) {
    try {
      const logData: LogData = {
        level,
        message,
        details,
        timestamp: new Date().toISOString()
      };

      // 发送日志到后端
      await axios.post('/api/logs', logData);

      // 同时在控制台输出
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(message, details);
          break;
        case LogLevel.INFO:
          console.info(message, details);
          break;
        case LogLevel.WARN:
          console.warn(message, details);
          break;
        case LogLevel.ERROR:
          console.error(message, details);
          break;
      }
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }

  public debug(message: string, details?: any) {
    this.log(LogLevel.DEBUG, message, details);
  }

  public info(message: string, details?: any) {
    this.log(LogLevel.INFO, message, details);
  }

  public warn(message: string, details?: any) {
    this.log(LogLevel.WARN, message, details);
  }

  public error(message: string, details?: any) {
    this.log(LogLevel.ERROR, message, details);
  }
}

export const logger = Logger.getInstance(); 