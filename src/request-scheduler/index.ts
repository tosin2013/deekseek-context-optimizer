import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';

type Request = {
  id: string;
  priority: number;
  timestamp: number;
  context: string;
  callback: (response: string) => void;
};

export class RequestScheduler {
  private queue: Request[];
  private readonly maxConcurrentRequests: number;
  private activeRequests: number;
  private readonly rateLimitWindow: number; // in milliseconds
  private lastRequestTime: number;

  constructor() {
    this.queue = [];
    this.maxConcurrentRequests = 5;
    this.activeRequests = 0;
    this.rateLimitWindow = 1000; // 1 second
    this.lastRequestTime = 0;
  }

  public async scheduleRequest(request: Omit<Request, 'id' | 'timestamp'>): Promise<void> {
    const requestId = this.generateRequestId();
    const timestamp = Date.now();
    
    const fullRequest: Request = {
      ...request,
      id: requestId,
      timestamp
    };

    this.queue.push(fullRequest);
    this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
    
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.canProcessNextRequest()) {
      const nextRequest = this.queue.shift();
      if (!nextRequest) break;

      this.activeRequests++;
      try {
        await this.enforceRateLimit();
        const response = await this.executeRequest(nextRequest.context);
        nextRequest.callback(response);
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Request processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        this.activeRequests--;
      }
    }
  }

  private canProcessNextRequest(): boolean {
    return this.queue.length > 0 && 
           this.activeRequests < this.maxConcurrentRequests &&
           this.isWithinRateLimit();
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitWindow) {
      await this.delay(this.rateLimitWindow - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  private async executeRequest(context: string): Promise<string> {
    // This will be replaced with actual API call logic
    return Promise.resolve(`Processed: ${context}`);
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isWithinRateLimit(): boolean {
    const now = Date.now();
    return now - this.lastRequestTime >= this.rateLimitWindow;
  }
}
