export class ConcurrencyLimiter {
    private queue: (() => void)[] = [];
    private runningCount = 0;
  
    constructor(private maxConcurrency: number) {}
  
    run = async <T>(fn: () => Promise<T>): Promise<T> => {
      console.log(`[ConcurrencyLimiter] Attempting to run. Current count: ${this.runningCount}`);
      await this.waitForSlot();
      
      try {
        console.log(`[ConcurrencyLimiter] Executing function. Count: ${this.runningCount}`);
        return await fn();
      } finally {
        this.releaseSlot();
      }
    };

    private waitForSlot = async (): Promise<void> => {
      if (this.runningCount >= this.maxConcurrency) {
        console.log(`[ConcurrencyLimiter] Waiting for slot. Queue length: ${this.queue.length}`);
        await new Promise<void>((resolve) => this.queue.push(resolve));
      }
      this.runningCount++;
    };

    private releaseSlot = (): void => {
      this.runningCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    };
  }