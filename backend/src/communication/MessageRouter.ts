import { logger } from '../utils/logger';

export class MessageRouter {
  private languageProcessor: any; // Will be typed once LanguageProcessor is implemented

  constructor(languageProcessor: any) {
    this.languageProcessor = languageProcessor;
  }

  /**
   * Route user message to AI language processing system
   */
  public async routeUserMessage(message: string): Promise<void> {
    logger.debug('Routing user message to language processor');

    if (!this.languageProcessor) {
      logger.warn('Language processor not initialized');
      return;
    }

    try {
      // Process through language system
      await this.languageProcessor.processUserInput(message);
    } catch (error) {
      logger.error('Error routing message:', error);
    }
  }

  /**
   * Route AI generated message to output
   */
  public async routeAIMessage(message: string, emotionalTone: number[]): Promise<void> {
    logger.debug('Routing AI message to output');

    // This will be handled by SocketHandler
    // Placeholder for now
  }

  /**
   * Parse user command (if message is a command rather than chat)
   */
  public parseCommand(message: string): { isCommand: boolean; command?: string; args?: string[] } {
    if (!message.startsWith('/')) {
      return { isCommand: false };
    }

    const parts = message.slice(1).split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    return { isCommand: true, command, args };
  }
}
