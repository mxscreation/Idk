import type {
  WorldObject,
  Vector3,
  ObjectShape,
  PhysicalProperties,
  SensoryProperties,
  VisualProperties,
  TactileProperties,
  AuditoryProperties,
  OlfactoryProperties,
  GustatoryProperties,
} from '../types';
import { generateId } from '../utils/helpers';

export class ObjectFactory {
  /**
   * Create a default world object with sensory properties
   */
  public static createObject(
    type: ObjectShape,
    position: Vector3,
    sensoryOverrides?: Partial<SensoryProperties>,
    physicalOverrides?: Partial<PhysicalProperties>
  ): WorldObject {
    const id = generateId('obj');

    const physicalDefaults = this.getDefaultPhysical(type);
    const sensoryDefaults = this.getDefaultSensory(type);

    const physical: PhysicalProperties = {
      ...physicalDefaults,
      ...physicalOverrides,
    };

    const sensory: SensoryProperties = {
      visual: { ...sensoryDefaults.visual, ...(sensoryOverrides?.visual || {}) },
      tactile: { ...sensoryDefaults.tactile, ...(sensoryOverrides?.tactile || {}) },
      auditory: { ...sensoryDefaults.auditory, ...(sensoryOverrides?.auditory || {}) },
      olfactory: { ...sensoryDefaults.olfactory, ...(sensoryOverrides?.olfactory || {}) },
      gustatory: { ...sensoryDefaults.gustatory, ...(sensoryOverrides?.gustatory || {}) },
      custom: sensoryOverrides?.custom,
    };

    return {
      id,
      type,
      position,
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      velocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      physical,
      sensory,
      createdAt: Date.now(),
    };
  }

  private static getDefaultPhysical(type: ObjectShape): PhysicalProperties {
    const defaults: Record<ObjectShape, PhysicalProperties> = {
      sphere: {
        shape: 'sphere',
        dimensions: { x: 0.5, y: 0.5, z: 0.5 }, // radius
        mass: 1.0,
        friction: 0.3,
        restitution: 0.5,
        isStatic: false,
      },
      box: {
        shape: 'box',
        dimensions: { x: 0.5, y: 0.5, z: 0.5 }, // half extents
        mass: 1.0,
        friction: 0.5,
        restitution: 0.2,
        isStatic: false,
      },
      cylinder: {
        shape: 'cylinder',
        dimensions: { x: 0.5, y: 1.0, z: 0.5 }, // radiusTop, height, radiusBottom
        mass: 1.0,
        friction: 0.4,
        restitution: 0.3,
        isStatic: false,
      },
      plane: {
        shape: 'plane',
        dimensions: { x: 20, y: 0, z: 20 }, // width, height (0 for plane), depth
        mass: 0,
        friction: 0.6,
        restitution: 0.1,
        isStatic: true,
      },
      custom: {
        shape: 'custom',
        dimensions: { x: 1, y: 1, z: 1 },
        mass: 1.0,
        friction: 0.3,
        restitution: 0.3,
        isStatic: false,
      },
    };

    return defaults[type];
  }

  private static getDefaultSensory(type: ObjectShape): SensoryProperties {
    // Different object types have different default sensory properties
    const colorMap: Record<ObjectShape, [number, number, number]> = {
      sphere: [255, 100, 100], // Red
      box: [100, 100, 255], // Blue
      cylinder: [100, 255, 100], // Green
      plane: [200, 200, 200], // Light gray
      custom: [255, 255, 100], // Yellow
    };

    return {
      visual: {
        color: colorMap[type],
        brightness: 0.7,
        transparency: 0,
        size: 1.0,
      },
      tactile: {
        texture: 0.5, // Medium smoothness
        hardness: 0.7, // Fairly hard
        temperature: 0.5, // Neutral temperature
        weight: 1.0,
      },
      auditory: {
        collisionSound: 'thud',
        volume: 0.5,
        pitch: 1.0,
      },
      olfactory: {
        intensity: 0.0, // No smell by default
        valence: 0.0,
      },
      gustatory: {
        sweet: 0,
        sour: 0,
        bitter: 0,
        salty: 0,
        umami: 0,
        intensity: 0,
        safeToTaste: false,
      },
    };
  }

  /**
   * Create initial world objects for a new session
   */
  public static createInitialWorld(): WorldObject[] {
    const objects: WorldObject[] = [];

    // Ground plane
    objects.push(
      this.createObject('plane', { x: 0, y: 0, z: 0 }, {
        visual: {
          color: [180, 180, 180],
          brightness: 0.6,
          transparency: 0,
          size: 20,
        },
      })
    );

    // Red sphere (nearby)
    objects.push(
      this.createObject('sphere', { x: 2, y: 1, z: 0 }, {
        visual: {
          color: [255, 80, 80],
          brightness: 0.8,
          transparency: 0,
          size: 0.5,
        },
        tactile: {
          texture: 0.1, // Very smooth
          hardness: 0.8,
          temperature: 0.5,
          weight: 1.0,
        },
      })
    );

    // Blue cube (a bit farther)
    objects.push(
      this.createObject('box', { x: -3, y: 0.5, z: 2 }, {
        visual: {
          color: [80, 80, 255],
          brightness: 0.7,
          transparency: 0,
          size: 1.0,
        },
        tactile: {
          texture: 0.6, // Slightly rough
          hardness: 0.9,
          temperature: 0.4, // Slightly cool
          weight: 2.0,
        },
      })
    );

    // Green cylinder
    objects.push(
      this.createObject('cylinder', { x: 0, y: 0.5, z: -4 }, {
        visual: {
          color: [80, 255, 80],
          brightness: 0.75,
          transparency: 0,
          size: 1.0,
        },
        tactile: {
          texture: 0.4,
          hardness: 0.6,
          temperature: 0.6, // Slightly warm
          weight: 1.5,
        },
      })
    );

    return objects;
  }
}
