import type { ConsoleLog } from '../types';
import { CONSOLE_LOG_TYPES, UI } from '../constants';

class ConsoleLogger {
  private logs: ConsoleLog[] = [];
  private originalConsole: Console;
  private isOverridden = false;
  private listeners: ((logs: ConsoleLog[]) => void)[] = [];

  constructor() {
    this.originalConsole = { ...console };
  }

  public overrideConsole(): void {
    if (this.isOverridden) return;
    
    this.isOverridden = true;
    
    // Override console methods
    console.log = (...args) => this.captureLog(CONSOLE_LOG_TYPES.LOG, ...args);
    console.info = (...args) => this.captureLog(CONSOLE_LOG_TYPES.INFO, ...args);
    console.warn = (...args) => this.captureLog(CONSOLE_LOG_TYPES.WARN, ...args);
    console.error = (...args) => this.captureLog(CONSOLE_LOG_TYPES.ERROR, ...args);
    console.debug = (...args) => this.captureLog(CONSOLE_LOG_TYPES.DEBUG, ...args);
  }

  public restoreConsole(): void {
    if (!this.isOverridden) return;
    
    this.isOverridden = false;
    
    // Restore original console methods
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
  }

  private captureLog(type: ConsoleLog['type'], ...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    const log: ConsoleLog = {
      id: this.generateId(),
      type,
      message,
      timestamp: new Date(),
      data: args.length > 1 ? args : undefined,
    };
    
    this.addLog(log);
    
    // Also call original console method
    this.originalConsole[type](...args);
  }

  public addLog(log: ConsoleLog): void {
    this.logs.unshift(log);
    
    // Keep only the last MAX_CONSOLE_LOGS
    if (this.logs.length > UI.MAX_CONSOLE_LOGS) {
      this.logs = this.logs.slice(0, UI.MAX_CONSOLE_LOGS);
    }
    
    this.notifyListeners();
  }

  public getLogs(): ConsoleLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  public subscribe(listener: (logs: ConsoleLog[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getLogs()));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public isConsoleOverridden(): boolean {
    return this.isOverridden;
  }
}

// Create singleton instance
export const consoleLogger = new ConsoleLogger();

export default ConsoleLogger; 