import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';

export class ContextSummarizer {
  private readonly maxSummaryLength: number;
  private readonly minContextLength: number;

  constructor() {
    this.maxSummaryLength = 2000; // Characters
    this.minContextLength = 3000; // Characters
  }

  public async summarize(context: string): Promise<string> {
    try {
      // Only summarize if context exceeds minimum length
      if (context.length <= this.minContextLength) {
        return context;
      }

      // Extract key sentences using basic heuristic approach
      const sentences = this.splitIntoSentences(context);
      const scoredSentences = this.scoreSentences(sentences);
      const summary = this.buildSummary(scoredSentences);

      return summary;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Context summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private splitIntoSentences(text: string): string[] {
    // Basic sentence splitting (can be enhanced with NLP later)
    return text.split(/(?<=[.!?])\s+/);
  }

  private scoreSentences(sentences: string[]): Array<{ text: string; score: number }> {
    return sentences.map(sentence => ({
      text: sentence,
      score: this.calculateSentenceScore(sentence)
    }));
  }

  private calculateSentenceScore(sentence: string): number {
    // Basic scoring based on sentence length and keyword presence
    let score = sentence.length * 0.1; // Longer sentences get higher score
    
    // Increase score for sentences containing important keywords
    const keywords = ['error', 'bug', 'fix', 'solution', 'problem', 'issue'];
    keywords.forEach(keyword => {
      if (sentence.toLowerCase().includes(keyword)) {
        score += 50;
      }
    });

    return score;
  }

  private buildSummary(scoredSentences: Array<{ text: string; score: number }>): string {
    // Sort sentences by score (descending)
    const sorted = scoredSentences.sort((a, b) => b.score - a.score);
    
    // Build summary until we reach max length
    let summary = '';
    for (const sentence of sorted) {
      if (summary.length + sentence.text.length > this.maxSummaryLength) {
        break;
      }
      summary += sentence.text + ' ';
    }

    return summary.trim();
  }
}
