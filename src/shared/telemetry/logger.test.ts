import { describe, it, expect } from 'vitest';
import { logger } from './logger';

describe('LoggerService', () => {
  it('should capture structured log entries with timestamp and level', () => {
    logger.info('TestContext', 'Testing info message', { meta: 123 });
    const logs = logger.getRecentLogs();

    expect(logs.length).toBeGreaterThan(0);
    const last = logs[0];
    expect(last.level).toBe('INFO');
    expect(last.context).toBe('TestContext');
    expect(last.message).toBe('Testing info message');
  });

  it('should notify registered listeners on new log events', () => {
    let notified = false;
    const unsubscribe = logger.addListener((entry) => {
      if (entry.message === 'Listener test') {
        notified = true;
      }
    });

    logger.warn('TestListener', 'Listener test');
    expect(notified).toBe(true);
    unsubscribe();
  });
});
