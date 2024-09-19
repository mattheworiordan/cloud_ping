export class ConcurrencyLimiter {
    private queue: (() => void)[] = [];
    private runningCount = 0;
  
    constructor(private maxConcurrency: number) {}
  
    async run<T>(fn: () => Promise<T>): Promise<T> {
      if (this.runningCount >= this.maxConcurrency) {
        await new Promise<void>(resolve => this.queue.push(resolve));
      }
  
      this.runningCount++;
  
      try {
        return await fn();
      } finally {
        this.runningCount--;
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          next?.();
        }
      }
    }
  }