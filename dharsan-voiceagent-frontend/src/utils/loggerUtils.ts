// Logger utility functions
export interface LogEntry {
  timestamp: string;
  message: string;
  service?: string;
}

export class ConversationLogger {
  private logs: string[] = [];
  private lastErrorLogs: { [key: string]: string } = {};
  private maxLogs: number = 20;

  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs = [...this.logs.slice(-(this.maxLogs - 1)), logEntry];
  }

  addErrorLog(service: string, message: string): void {
    if (this.lastErrorLogs[service] !== message) {
      this.addLog(message);
      this.lastErrorLogs[service] = message;
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.lastErrorLogs = {};
  }

  getLogCount(): number {
    return this.logs.length;
  }
}

export const createTimestampedLog = (message: string): string => {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] ${message}`;
}; 