import { CONFIG } from '../config/constants';
import { normalizeArray, clamp } from '../utils/helpers';
import type { EmotionState } from '../types';

export class EmotionSystem {
  private emotionVector: number[] = Array(CONFIG.EMOTION_DIMENSIONS).fill(0);
  private emotionHistory: number[][] = [];
  private maxHistoryLength: number = 100;

  /**
   * Update emotion state from neural network output
   */
  public update(newEmotionVector: number[]): void {
    // Emotion changes gradually (momentum)
    const momentum = 0.7;

    for (let i = 0; i < CONFIG.EMOTION_DIMENSIONS; i++) {
      this.emotionVector[i] =
        momentum * this.emotionVector[i] + (1 - momentum) * (newEmotionVector[i] || 0);

      // Clamp to reasonable range
      this.emotionVector[i] = clamp(this.emotionVector[i], -2, 2);
    }

    // Normalize to prevent drift
    this.emotionVector = normalizeArray(this.emotionVector);

    // Store in history
    this.emotionHistory.push([...this.emotionVector]);
    if (this.emotionHistory.length > this.maxHistoryLength) {
      this.emotionHistory.shift();
    }
  }

  /**
   * Get current emotion state vector
   */
  public getState(): number[] {
    return [...this.emotionVector];
  }

  /**
   * Get display-friendly emotion state
   */
  public getDisplayState(): EmotionState {
    // Derive valence and arousal from vector
    const valence = this.deriveValence();
    const arousal = this.deriveArousal();

    return {
      vector: [...this.emotionVector],
      valence,
      arousal,
      timestamp: Date.now(),
    };
  }

  /**
   * Derive valence (positive/negative feeling) from emotion vector
   */
  private deriveValence(): number {
    // Simple heuristic: average of positive vs negative dimensions
    const positiveSum = this.emotionVector
      .filter(v => v > 0)
      .reduce((sum, v) => sum + v, 0);
    const negativeSum = Math.abs(
      this.emotionVector.filter(v => v < 0).reduce((sum, v) => sum + v, 0)
    );

    const total = positiveSum + negativeSum;
    if (total === 0) return 0;

    return (positiveSum - negativeSum) / total;
  }

  /**
   * Derive arousal (energy level) from emotion vector
   */
  private deriveArousal(): number {
    // Magnitude of emotion vector = arousal
    const magnitude = Math.sqrt(
      this.emotionVector.reduce((sum, v) => sum + v * v, 0)
    );

    // Normalize to 0-1 range
    return clamp(magnitude, 0, 1);
  }

  /**
   * Check if current state is similar to past states (pattern recognition)
   */
  public findSimilarPastState(threshold: number = 0.8): number[][] {
    const similar: number[][] = [];

    for (const pastState of this.emotionHistory) {
      const similarity = this.calculateSimilarity(this.emotionVector, pastState);
      if (similarity > threshold) {
        similar.push(pastState);
      }
    }

    return similar;
  }

  /**
   * Calculate similarity between two emotion vectors
   */
  private calculateSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Serialize for saving
   */
  public serialize(): any {
    return {
      emotionVector: [...this.emotionVector],
      emotionHistory: this.emotionHistory.map(h => [...h]),
    };
  }

  /**
   * Deserialize from save
   */
  public deserialize(data: any): void {
    this.emotionVector = data.emotionVector || Array(CONFIG.EMOTION_DIMENSIONS).fill(0);
    this.emotionHistory = data.emotionHistory || [];
  }
}
