// Enterprise Structured Logging Abstraction
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

export type LogListener = (entry: LogEntry) => void;

class LoggerService {
  private listeners: LogListener[] = [];
  private logs: LogEntry[] = [];
  private readonly maxInMemoryLogs = 200;

  constructor() {
    // In dev, route to console cleanly
  }

  public addListener(listener: LogListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private log(level: LogLevel, context: string, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxInMemoryLogs) {
      this.logs.pop();
    }

    if (import.meta.env.DEV) {
      const formatted = `[${entry.timestamp.substring(11, 19)}] [${level}] [${context}]: ${message}`;
      if (level === 'ERROR') {
        console.error(formatted, data ?? '');
      } else if (level === 'WARN') {
        console.warn(formatted, data ?? '');
      } else if (level === 'INFO') {
        console.info(formatted, data ?? '');
      } else {
        console.debug(formatted, data ?? '');
      }
    }

    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Failed to notify logger listener', err);
      }
    });
  }

  public debug(context: string, message: string, data?: unknown) {
    this.log('DEBUG', context, message, data);
  }

  public info(context: string, message: string, data?: unknown) {
    this.log('INFO', context, message, data);
  }

  public warn(context: string, message: string, data?: unknown) {
    this.log('WARN', context, message, data);
  }

  public error(context: string, message: string, data?: unknown) {
    this.log('ERROR', context, message, data);
  }

  public getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = new LoggerService();
