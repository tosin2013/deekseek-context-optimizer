import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';
import { createClient, RedisClientType } from 'redis';

export class CacheManager {
  private client: RedisClientType;
  private readonly cacheExpiration: number; // in seconds

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.cacheExpiration = 3600; // 1 hour
  }

  public async initialize(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Cache initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async getCachedContext(key: string): Promise<string | null> {
    try {
      const cached = await this.client.get(key);
      return cached;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Cache retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async cacheContext(key: string, context: string): Promise<void> {
    try {
      await this.client.set(key, context, {
        EX: this.cacheExpiration
      });
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Cache storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async invalidateCache(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Cache invalidation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Cache shutdown failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
