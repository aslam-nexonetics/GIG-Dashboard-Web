/**
 * Application-wide structured logging utility for GIG Dashboard.
 * Records console output and keeps an in-memory ring buffer of recent logs for audit/diagnostics.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: unknown;
}

const MAX_STORED_LOGS = 150;
const inMemoryLogs: LogEntry[] = [];
let cachedSnapshot: LogEntry[] = [];
type LogListener = (entry?: LogEntry) => void;
const listeners = new Set<LogListener>();

function notifyListeners(entry?: LogEntry) {
  cachedSnapshot = [...inMemoryLogs];
  listeners.forEach((listener) => {
    try {
      listener(entry);
    } catch {
      // Ignore listener errors
    }
  });
}

function createEntry(level: LogLevel, tag: string, message: string, data?: unknown): LogEntry {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    tag,
    message,
    data,
  };

  inMemoryLogs.unshift(entry);
  if (inMemoryLogs.length > MAX_STORED_LOGS) {
    inMemoryLogs.pop();
  }

  notifyListeners(entry);
  return entry;
}

export const logger = {
  debug(tag: string, message: string, data?: unknown) {
    createEntry('DEBUG', tag, message, data);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`%c[${tag}] %c${message}`, 'color: #94a3b8; font-weight: bold;', 'color: inherit;', data ?? '');
    }
  },

  info(tag: string, message: string, data?: unknown) {
    createEntry('INFO', tag, message, data);
    console.info(`%c[${tag}] %c${message}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', data ?? '');
  },

  warn(tag: string, message: string, data?: unknown) {
    createEntry('WARN', tag, message, data);
    console.warn(`%c[${tag}] %c${message}`, 'color: #f59e0b; font-weight: bold;', 'color: inherit;', data ?? '');
  },

  error(tag: string, message: string, error?: unknown) {
    createEntry('ERROR', tag, message, error);
    console.error(`%c[${tag}] %c${message}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', error ?? '');
  },

  api(method: string, endpoint: string, status: number, durationMs: number, error?: string) {
    const isSuccess = status >= 200 && status < 300;
    const level: LogLevel = isSuccess ? 'INFO' : 'ERROR';
    const message = `${method.toUpperCase()} ${endpoint} -> ${status} (${durationMs}ms)${error ? ` - ${error}` : ''}`;
    createEntry(level, 'API', message, { method, endpoint, status, durationMs, error });
  },

  getRecentLogs(): LogEntry[] {
    return [...inMemoryLogs];
  },

  getSnapshot(): LogEntry[] {
    return cachedSnapshot;
  },

  clearLogs() {
    inMemoryLogs.length = 0;
    notifyListeners();
  },

  subscribe(listener: LogListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
