import { MemorySystem } from './MemorySystem';
import { logger } from '../utils/logger';
import type { SensoryInput } from '../types';

export class LanguageProcessor {
  private memorySystem: MemorySystem;
  private pendingMessages: string[] = [];
  private vocabulary: Map<string, number[]> = new Map(); // word -> embedding
  private processingDelay: number = 0;

  constructor(memorySystem: MemorySystem) {
    this.memorySystem = memorySystem;
  }

  /**
   * Process user input message
   */
  public processUserInput(message: string): void {
    logger.debug(`Processing user message: ${message}`);

    this.pendingMessages.push(message);

    // Start learning from this input
    this.learnFromInput(message);
  }

  /**
   * Learn from user input (grounded language acquisition)
   */
  private learnFromInput(message: string): void {
    const words = message.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (word.length < 2) continue;

      // Create simple embedding (in full implementation would be more sophisticated)
      const embedding = this.createSimpleEmbedding(word);

      // Add to vocabulary via memory system
      this.memorySystem.addVocabulary(word, embedding, [message]);

      logger.debug(`Learning word: ${word}`);
    }
  }

  /**
   * Create simple word embedding
   */
  private createSimpleEmbedding(word: string): number[] {
    // Very simplified embedding (in reality would learn from context)
    const embedding = new Array(64).fill(0);

    // Use character codes to create unique pattern
    for (let i = 0; i < word.length && i < 64; i++) {
      embedding[i] = (word.charCodeAt(i) % 256) / 256;
    }

    return embedding;
  }

  /**
   * Process language system
   */
  public process(deltaTime: number): void {
    // Process pending messages with delay (simulates gradual learning)
    this.processingDelay += deltaTime;

    if (this.processingDelay > 1.0 && this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      // Additional processing could happen here
      this.processingDelay = 0;
    }
  }

  /**
   * Generate internal thought (if language developed)
   */
  public generateThought(sensoryInput: SensoryInput, emotionState: number[]): string {
    if (this.memorySystem.getVocabularySize() < 5) {
      return '...'; // No language yet
    }

    // Simple thought generation based on what's perceived
    if (sensoryInput.visual.length > 0) {
      const objectCount = sensoryInput.visual.length;

      if (objectCount === 1) {
        return 'I see something...';
      } else if (objectCount > 3) {
        return 'Many things here...';
      } else {
        return 'What is this?';
      }
    }

    return 'Looking around...';
  }

  /**
   * Check if AI has developed language
   */
  public hasLanguage(): boolean {
    return this.memorySystem.getVocabularySize() > 3;
  }

  /**
   * Get vocabulary size
   */
  public getVocabularySize(): number {
    return this.memorySystem.getVocabularySize();
  }

  /**
   * Serialize for saving
   */
  public serialize(): any {
    return {
      pendingMessages: [...this.pendingMessages],
      processingDelay: this.processingDelay,
    };
  }

  /**
   * Deserialize from save
   */
  public deserialize(data: any): void {
    this.pendingMessages = data.pendingMessages || [];
    this.processingDelay = data.processingDelay || 0;
  }
}
