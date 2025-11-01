import { PhysicsWorld } from './PhysicsWorld';
import { ObjectFactory } from './ObjectFactory';
import { SensoryDatabase } from './SensoryDatabase';
import { logger } from '../utils/logger';
import type {
  WorldObject,
  Vector3,
  ObjectShape,
  AddObjectEvent,
  SensoryProperties,
} from '../types';

export class WorldState {
  private objects: Map<string, WorldObject> = new Map();
  private physicsWorld: PhysicsWorld;
  private sensoryDatabase: SensoryDatabase;
  private time: number = 0;

  constructor(physicsWorld: PhysicsWorld) {
    this.physicsWorld = physicsWorld;
    this.sensoryDatabase = new SensoryDatabase();

    // Initialize with default world
    this.initializeWorld();
  }

  private initializeWorld() {
    logger.info('Initializing world with starting objects');

    const initialObjects = ObjectFactory.createInitialWorld();

    for (const obj of initialObjects) {
      this.addObjectInternal(obj);
    }

    logger.info(`World initialized with ${this.objects.size} objects`);
  }

  /**
   * Update world state
   */
  public update(deltaTime: number): void {
    this.time += deltaTime;

    // Sync physics bodies to world objects
    for (const [id, obj] of this.objects) {
      const body = this.physicsWorld.getBody(id);
      if (body) {
        obj.position = this.physicsWorld.getPosition(id) || obj.position;
        obj.velocity = this.physicsWorld.getVelocity(id) || obj.velocity;
        obj.rotation = this.physicsWorld.getQuaternion(id) || obj.rotation;
      }
    }
  }

  /**
   * Add object from AddObjectEvent
   */
  public addObject(event: AddObjectEvent): WorldObject {
    const object = ObjectFactory.createObject(
      event.type,
      event.position,
      event.properties,
      event.physical
    );

    this.addObjectInternal(object);
    return object;
  }

  /**
   * Add object internally
   */
  private addObjectInternal(object: WorldObject): void {
    // Create physics body
    const body = this.createPhysicsBody(object);
    this.physicsWorld.addBody(object.id, body);

    // Add to sensory database
    this.sensoryDatabase.addObject(object.id, object.sensory);

    // Store object
    this.objects.set(object.id, object);

    logger.debug(`Object added: ${object.id} (${object.type})`);
  }

  /**
   * Remove object
   */
  public removeObject(objectId: string): void {
    this.physicsWorld.removeBody(objectId);
    this.sensoryDatabase.removeObject(objectId);
    this.objects.delete(objectId);

    logger.debug(`Object removed: ${objectId}`);
  }

  /**
   * Modify object properties
   */
  public modifyObject(objectId: string, properties: Partial<SensoryProperties>): void {
    const object = this.objects.get(objectId);
    if (!object) {
      logger.warn(`Cannot modify non-existent object: ${objectId}`);
      return;
    }

    // Update sensory properties
    if (properties.visual) {
      object.sensory.visual = { ...object.sensory.visual, ...properties.visual };
    }
    if (properties.tactile) {
      object.sensory.tactile = { ...object.sensory.tactile, ...properties.tactile };
    }
    if (properties.auditory) {
      object.sensory.auditory = { ...object.sensory.auditory, ...properties.auditory };
    }
    if (properties.olfactory) {
      object.sensory.olfactory = { ...object.sensory.olfactory, ...properties.olfactory };
    }
    if (properties.gustatory) {
      object.sensory.gustatory = { ...object.sensory.gustatory, ...properties.gustatory };
    }

    // Update in sensory database
    this.sensoryDatabase.updateObject(objectId, object.sensory);

    logger.debug(`Object modified: ${objectId}`);
  }

  /**
   * Get all objects
   */
  public getAllObjects(): WorldObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Get object by ID
   */
  public getObject(id: string): WorldObject | undefined {
    return this.objects.get(id);
  }

  /**
   * Get objects within radius of position
   */
  public getObjectsInRadius(position: Vector3, radius: number): WorldObject[] {
    const results: WorldObject[] = [];

    for (const obj of this.objects.values()) {
      const dx = obj.position.x - position.x;
      const dy = obj.position.y - position.y;
      const dz = obj.position.z - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance <= radius) {
        results.push(obj);
      }
    }

    return results;
  }

  /**
   * Set gravity
   */
  public setGravity(value: number): void {
    this.physicsWorld.setGravity(value);
  }

  /**
   * Get current world time
   */
  public getTime(): number {
    return this.time;
  }

  /**
   * Get sensory database
   */
  public getSensoryDatabase(): SensoryDatabase {
    return this.sensoryDatabase;
  }

  /**
   * Create physics body for an object
   */
  private createPhysicsBody(object: WorldObject): any {
    const { type, position, physical } = object;

    let body;

    switch (type) {
      case 'sphere':
        body = this.physicsWorld.createSphere(physical.dimensions.x, physical.mass, position);
        break;

      case 'box':
        body = this.physicsWorld.createBox(physical.dimensions, physical.mass, position);
        break;

      case 'cylinder':
        body = this.physicsWorld.createCylinder(
          physical.dimensions.x, // radiusTop
          physical.dimensions.z, // radiusBottom
          physical.dimensions.y, // height
          physical.mass,
          position
        );
        break;

      case 'plane':
        body = this.physicsWorld.createPlane(position);
        break;

      default:
        body = this.physicsWorld.createBox(physical.dimensions, physical.mass, position);
    }

    // Set material properties
    if (body.material) {
      body.material.friction = physical.friction;
      body.material.restitution = physical.restitution;
    }

    return body;
  }

  /**
   * Clear all objects (except ground)
   */
  public clearObjects(): void {
    const objectsToRemove = Array.from(this.objects.keys()).filter(id => {
      const obj = this.objects.get(id);
      return obj?.type !== 'plane';
    });

    for (const id of objectsToRemove) {
      this.removeObject(id);
    }

    logger.info('All objects cleared (except ground plane)');
  }
}
