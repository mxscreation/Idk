import { logger } from '../utils/logger';
import type { NeuralOutput } from '../types';

export class CreativityModule {
  private creativeEventCount: number = 0;
  private lastActions: string[] = [];
  private maxHistoryLength: number = 50;

  /**
   * Detect creative behaviors
   */
  public detect(neuralOutput: NeuralOutput, memorySystem: any): void {
    // Detect problem-solving creativity
    this.detectNovelSolutions(neuralOutput);

    // Detect exploratory creativity
    this.detectExploration(neuralOutput);

    // Log creative behaviors
    // (In full implementation would have more sophisticated detection)
  }

  /**
   * Detect novel solutions
   */
  private detectNovelSolutions(neuralOutput: NeuralOutput): void {
    const action = this.encodeAction(neuralOutput);

    // Check if this action is novel (not seen before)
    if (!this.lastActions.includes(action)) {
      this.creativeEventCount++;
      logger.debug('Creative behavior detected: novel action');
    }

    // Store action
    this.lastActions.push(action);
    if (this.lastActions.length > this.maxHistoryLength) {
      this.lastActions.shift();
    }
  }

  /**
   * Detect exploratory behavior
   */
  private detectExploration(neuralOutput: NeuralOutput): void {
    // High motor activity with attention switching = exploration
    if (
      neuralOutput.motor.forceMagnitude > 0.5 &&
      neuralOutput.attention.searchPattern === 'novelty'
    ) {
      // This is exploratory behavior (good!)
      // Don't increment creative count for normal exploration
    }
  }

  /**
   * Encode action as string for comparison
   */
  private encodeAction(neuralOutput: NeuralOutput): string {
    const motor = neuralOutput.motor;
    return `${motor.forceDirection.x.toFixed(1)},${motor.forceDirection.y.toFixed(1)},${motor.forceDirection.z.toFixed(1)},${motor.forceMagnitude.toFixed(1)}`;
  }

  /**
   * Get creative event count
   */
  public getCreativeEventCount(): number {
    return this.creativeEventCount;
  }
}
