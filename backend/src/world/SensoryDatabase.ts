import type { SensoryProperties } from '../types';

/**
 * Database of sensory properties for all objects in the world
 * Provides fast lookup for sensory processing
 */
export class SensoryDatabase {
  private database: Map<string, SensoryProperties> = new Map();

  /**
   * Add object sensory properties
   */
  public addObject(objectId: string, properties: SensoryProperties): void {
    this.database.set(objectId, properties);
  }

  /**
   * Remove object from database
   */
  public removeObject(objectId: string): void {
    this.database.delete(objectId);
  }

  /**
   * Update object sensory properties
   */
  public updateObject(objectId: string, properties: SensoryProperties): void {
    this.database.set(objectId, properties);
  }

  /**
   * Get sensory properties for an object
   */
  public getProperties(objectId: string): SensoryProperties | undefined {
    return this.database.get(objectId);
  }

  /**
   * Get all objects with their sensory properties
   */
  public getAllProperties(): Map<string, SensoryProperties> {
    return this.database;
  }

  /**
   * Find objects by visual color similarity
   */
  public findByColorSimilarity(targetColor: [number, number, number], threshold: number = 50): string[] {
    const results: string[] = [];

    for (const [id, props] of this.database) {
      const color = props.visual.color;
      const distance = Math.sqrt(
        Math.pow(color[0] - targetColor[0], 2) +
          Math.pow(color[1] - targetColor[1], 2) +
          Math.pow(color[2] - targetColor[2], 2)
      );

      if (distance <= threshold) {
        results.push(id);
      }
    }

    return results;
  }

  /**
   * Find objects by temperature
   */
  public findByTemperature(minTemp: number, maxTemp: number): string[] {
    const results: string[] = [];

    for (const [id, props] of this.database) {
      const temp = props.tactile.temperature;
      if (temp >= minTemp && temp <= maxTemp) {
        results.push(id);
      }
    }

    return results;
  }

  /**
   * Find objects with smell
   */
  public findBySmell(smellId?: string, minIntensity: number = 0.1): string[] {
    const results: string[] = [];

    for (const [id, props] of this.database) {
      const olfactory = props.olfactory;
      if (olfactory.intensity >= minIntensity) {
        if (!smellId || olfactory.smellId === smellId) {
          results.push(id);
        }
      }
    }

    return results;
  }

  /**
   * Get count of objects in database
   */
  public getCount(): number {
    return this.database.size;
  }
}
