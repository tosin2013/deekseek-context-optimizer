import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';

export class ContextPreprocessor {
  private readonly stopWords: Set<string>;
  
  constructor() {
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
      'at', 'by', 'for', 'in', 'of', 'on', 'to', 'with', 'as', 'about',
      'after', 'before', 'during', 'until', 'above', 'below', 'from',
      'up', 'down', 'out', 'over', 'under', 'again', 'further', 'once',
      'here', 'there', 'where', 'why', 'how', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
    ]);
  }

  public async preprocess(context: string): Promise<string> {
    try {
      // Remove extra whitespace and normalize line endings
      let processed = context.replace(/\s+/g, ' ').trim();
      
      // Remove common stop words
      processed = processed
        .split(' ')
        .filter(word => !this.stopWords.has(word.toLowerCase()))
        .join(' ');

      // Remove redundant phrases and repeated code snippets
      processed = this.removeRedundantPhrases(processed);

      return processed;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Context preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private removeRedundantPhrases(text: string): string {
    // TODO: Implement more sophisticated redundancy detection
    return text;
  }
}
