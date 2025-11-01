import { WorldState } from '../world/WorldState';
import { CONFIG } from '../config/constants';
import { distance3D, dotProduct, normalizeVector } from '../utils/helpers';
import type {
  SensoryInput,
  VisualInput,
  TactileInput,
  AuditoryInput,
  OlfactoryInput,
  GustatoryInput,
  ProprioceptiveInput,
  InternalInput,
  Vector3,
  Quaternion,
} from '../types';

export class SensoryProcessor {
  private previousEmotion: number[] = Array(CONFIG.EMOTION_DIMENSIONS).fill(0);

  /**
   * Process all sensory modalities
   */
  public process(
    aiPosition: Vector3,
    aiOrientation: Quaternion,
    worldState: WorldState,
    attentionTarget: string | null
  ): SensoryInput {
    const allObjects = worldState.getAllObjects();
    const sensoryDB = worldState.getSensoryDatabase();

    // Visual processing
    const visual = this.processVisual(aiPosition, aiOrientation, allObjects, sensoryDB, attentionTarget);

    // Tactile processing (collision-based)
    const tactile = this.processTactile(aiPosition, allObjects, sensoryDB);

    // Auditory processing
    const auditory = this.processAuditory(aiPosition, allObjects, sensoryDB);

    // Olfactory processing
    const olfactory = this.processOlfactory(aiPosition, allObjects, sensoryDB);

    // Gustatory processing (requires intentional tasting)
    const gustatory: GustatoryInput[] = [];

    // Proprioceptive input
    const proprioceptive: ProprioceptiveInput = {
      position: aiPosition,
      velocity: { x: 0, y: 0, z: 0 }, // Will be updated from physics
      orientation: aiOrientation,
      angularVelocity: { x: 0, y: 0, z: 0 },
    };

    // Internal state
    const internal: InternalInput = {
      energy: 1.0,
      arousal: 0.5,
      previousEmotion: this.previousEmotion,
    };

    return {
      visual,
      tactile,
      auditory,
      olfactory,
      gustatory,
      proprioceptive,
      internal,
    };
  }

  /**
   * Process visual input (what AI can see)
   */
  private processVisual(
    aiPosition: Vector3,
    aiOrientation: Quaternion,
    objects: any[],
    sensoryDB: any,
    attentionTarget: string | null
  ): VisualInput[] {
    const visualInputs: VisualInput[] = [];

    const aiForward = this.quaternionToForward(aiOrientation);

    for (const obj of objects) {
      // Skip if too far
      const distance = distance3D(aiPosition, obj.position);
      if (distance > 50) continue;

      // Calculate direction to object
      const toObject = {
        x: obj.position.x - aiPosition.x,
        y: obj.position.y - aiPosition.y,
        z: obj.position.z - aiPosition.z,
      };
      const normalizedDir = normalizeVector(toObject);

      // Calculate angle to object
      const angle = Math.acos(dotProduct(aiForward, normalizedDir));

      // Check if in field of view
      const fovRadians = (CONFIG.SENSORY.VISUAL_FOV * Math.PI) / 180;
      if (angle > fovRadians / 2) continue;

      const properties = sensoryDB.getProperties(obj.id);
      if (!properties) continue;

      const isInFocus = obj.id === attentionTarget;
      const effectiveDistance = isInFocus ? distance / CONFIG.SENSORY.ATTENTION_SPOTLIGHT_BOOST : distance;

      visualInputs.push({
        objectId: obj.id,
        color: properties.visual.color,
        brightness: properties.visual.brightness,
        size: properties.visual.size / effectiveDistance,
        distance: effectiveDistance,
        angle,
        inFocus: isInFocus,
      });
    }

    // Sort by distance (closer objects processed first)
    visualInputs.sort((a, b) => a.distance - b.distance);

    return visualInputs;
  }

  /**
   * Process tactile input (collision-based touch)
   */
  private processTactile(aiPosition: Vector3, objects: any[], sensoryDB: any): TactileInput[] {
    const tactileInputs: TactileInput[] = [];

    for (const obj of objects) {
      const distance = distance3D(aiPosition, obj.position);

      // Check if in contact (simplified collision detection)
      const contactThreshold = 1.0; // Within 1 unit
      if (distance < contactThreshold) {
        const properties = sensoryDB.getProperties(obj.id);
        if (!properties) continue;

        // Estimate pressure based on distance
        const pressure = Math.max(0, 1 - distance / contactThreshold);

        tactileInputs.push({
          objectId: obj.id,
          texture: properties.tactile.texture,
          temperature: properties.tactile.temperature,
          hardness: properties.tactile.hardness,
          pressure,
          contactPoint: obj.position,
        });
      }
    }

    return tactileInputs;
  }

  /**
   * Process auditory input (sounds from objects)
   */
  private processAuditory(aiPosition: Vector3, objects: any[], sensoryDB: any): AuditoryInput[] {
    const auditoryInputs: AuditoryInput[] = [];

    for (const obj of objects) {
      const distance = distance3D(aiPosition, obj.position);

      // Check if in hearing range
      if (distance > CONFIG.SENSORY.HEARING_RANGE) continue;

      const properties = sensoryDB.getProperties(obj.id);
      if (!properties || !properties.auditory.collisionSound) continue;

      // Attenuation by distance
      const attenuation = 1 - distance / CONFIG.SENSORY.HEARING_RANGE;
      const effectiveVolume = properties.auditory.volume * attenuation;

      if (effectiveVolume > 0.01) {
        // Calculate direction
        const dx = obj.position.x - aiPosition.x;
        const dz = obj.position.z - aiPosition.z;
        const direction = Math.atan2(dz, dx);

        auditoryInputs.push({
          objectId: obj.id,
          frequency: properties.auditory.pitch || 440,
          volume: effectiveVolume,
          distance,
          direction,
        });
      }
    }

    return auditoryInputs;
  }

  /**
   * Process olfactory input (smells)
   */
  private processOlfactory(aiPosition: Vector3, objects: any[], sensoryDB: any): OlfactoryInput[] {
    const olfactoryInputs: OlfactoryInput[] = [];

    for (const obj of objects) {
      const distance = distance3D(aiPosition, obj.position);

      // Check if in smell range
      if (distance > CONFIG.SENSORY.SMELL_RANGE) continue;

      const properties = sensoryDB.getProperties(obj.id);
      if (!properties || !properties.olfactory.smellId) continue;

      // Intensity decreases with distance
      const attenuation = 1 - distance / CONFIG.SENSORY.SMELL_RANGE;
      const effectiveIntensity = properties.olfactory.intensity * attenuation;

      if (effectiveIntensity > 0.01) {
        olfactoryInputs.push({
          objectId: obj.id,
          smellId: properties.olfactory.smellId,
          intensity: effectiveIntensity,
          valence: properties.olfactory.valence,
          distance,
        });
      }
    }

    return olfactoryInputs;
  }

  /**
   * Convert quaternion to forward vector
   */
  private quaternionToForward(q: Quaternion): Vector3 {
    // Simplified quaternion to forward vector conversion
    return {
      x: 2 * (q.x * q.z + q.w * q.y),
      y: 2 * (q.y * q.z - q.w * q.x),
      z: 1 - 2 * (q.x * q.x + q.y * q.y),
    };
  }

  /**
   * Update previous emotion for next cycle
   */
  public updatePreviousEmotion(emotion: number[]): void {
    this.previousEmotion = emotion;
  }
}
