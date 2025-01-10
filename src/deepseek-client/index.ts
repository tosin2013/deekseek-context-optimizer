/// <reference types="node" />
import { McpError } from '@modelcontextprotocol/sdk/types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface DeepSeekConfig {
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_API_URL?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends DeepSeekConfig {}
  }
}

// Define error codes matching MCP SDK
const ErrorCode = {
  ConfigurationError: 1001,
  InternalError: 1002
} as const;

export class DeepSeekClient {
  private client: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new McpError(
        ErrorCode.ConfigurationError,
        'DeepSeek API key is required in environment variables'
      );
    }

    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v3';
    

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 10000
    });
  }

  public async sendRequest(context: string): Promise<string> {
    try {
      const response: AxiosResponse = await this.client.post('/completions', {
        model: 'deepseek-v3',
        prompt: context,
        max_tokens: 2048,
        temperature: 0.7
      });

      if (!response.data?.choices?.[0]?.text) {
        throw new McpError(
          ErrorCode.InternalError,
          'Invalid response format from DeepSeek API'
        );
      }

      return response.data.choices[0].text;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `DeepSeek API request failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `DeepSeek API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
