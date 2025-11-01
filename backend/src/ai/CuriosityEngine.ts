import { CONFIG } from '../config/constants';
import { MemorySystem } from './MemorySystem';
import type { SensoryInput, AttentionState } from '../types';

export class CuriosityEngine {
  private memorySystem: MemorySystem;
  private curiosityLevel: number = 0.8; // Start high (everything is novel)
  private attentionTarget: string | null = null;
  private attentionStrength: number = 0;
  private noveltyScore: number = 0;
  private predictionError: number = 0;

  constructor(memorySystem: MemorySystem) {
    this.memorySystem = memorySystem;
  }

  /**
   * Update curiosity based on current sensory input
   */
  public update(sensoryInput: SensoryInput, memorySystem: MemorySystem): void {
    // Calculate novelty
    this.noveltyScore = this.calculateNovelty(sensoryInput);

    // Prediction error would come from neural network
    // For now, use novelty as proxy
    this.predictionError = this.noveltyScore * 0.5 + Math.random() * 0.3;

    // Calculate overall curiosity drive
    this.curiosityLevel = this.calculateCuriosityDrive();

    // Update attention target based on novelty
    this.updateAttention(sensoryInput);
  }

  /**
   * Calculate novelty score
   */
  private calculateNovelty(sensoryInput: SensoryInput): number {
    const episodicCount = this.memorySystem.getEpisodicCount();

    // If very few memories, everything is novel
    if (episodicCount < 10) {
      return 0.9;
    }

    // Check for completely new visual patterns
    const hasNewObjects = sensoryInput.visual.some(v => {
      // Simplified: assume some randomness means novelty
      return Math.random() < 0.3;
    });

    if (hasNewObjects) {
      return 0.7 + Math.random() * 0.3;
    }

    // Otherwise moderate novelty
    return 0.3 + Math.random() * 0.4;
  }

  /**
   * Calculate curiosity drive
   */
  private calculateCuriosityDrive(): number {
    const drive =
      CONFIG.CURIOSITY.NOVELTY_WEIGHT * this.noveltyScore +
      CONFIG.CURIOSITY.PREDICTION_ERROR_WEIGHT * this.predictionError +
      CONFIG.CURIOSITY.COMPETENCE_WEIGHT * 0.2; // Placeholder for competence

    return Math.max(0, Math.min(1, drive));
  }

  /**
   * Update attention target
   */
  private updateAttention(sensoryInput: SensoryInput): void {
    if (sensoryInput.visual.length === 0) {
      this.attentionTarget = null;
      this.attentionStrength = 0;
      return;
    }

    // Focus on novel or surprising objects
    if (this.noveltyScore > 0.5 && Math.random() < this.curiosityLevel) {
      // Pick a random visible object to focus on
      const randomIndex = Math.floor(Math.random() * sensoryInput.visual.length);
      this.attentionTarget = sensoryInput.visual[randomIndex].objectId;
      this.attentionStrength = this.curiosityLevel;
    } else {
      // Maintain current attention or let it decay
      this.attentionStrength *= 0.95;
      if (this.attentionStrength < 0.1) {
        this.attentionTarget = null;
      }
    }
  }

  /**
   * Get current attention target
   */
  public getAttentionTarget(): string | null {
    return this.attentionTarget;
  }

  /**
   * Set attention target (from neural output)
   */
  public setAttentionTarget(targetId: string): void {
    this.attentionTarget = targetId;
    this.attentionStrength = 0.8;
  }

  /**
   * Get attention state
   */
  public getAttentionState(): AttentionState {
    return {
      targetId: this.attentionTarget,
      strength: this.attentionStrength,
      focusPosition: null,
    };
  }

  /**
   * Get curiosity level
   */
  public getCuriosityLevel(): number {
    return this.curiosityLevel;
  }

  /**
   * Get novelty score
   */
  public getNoveltyScore(): number {
    return this.noveltyScore;
  }
}
