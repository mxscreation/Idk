import * as CANNON from 'cannon-es';
import { CONFIG } from '../config/constants';
import { logger } from '../utils/logger';
import type { Vector3, Quaternion } from '../types';

export class PhysicsWorld {
  private world: CANNON.World;
  private bodies: Map<string, CANNON.Body> = new Map();
  private timeAccumulator: number = 0;

  constructor() {
    // Initialize Cannon.js world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, CONFIG.GRAVITY, 0),
    });

    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.solver.iterations = CONFIG.SOLVER_ITERATIONS;
    this.world.defaultContactMaterial.friction = CONFIG.DEFAULT_FRICTION;
    this.world.defaultContactMaterial.restitution = CONFIG.DEFAULT_RESTITUTION;

    logger.info('Physics world initialized');
  }

  /**
   * Step the physics simulation
   */
  public step(deltaTime: number): void {
    // Fixed timestep with accumulator for stability
    this.timeAccumulator += deltaTime;

    while (this.timeAccumulator >= CONFIG.TIME_STEP) {
      this.world.step(CONFIG.TIME_STEP);
      this.timeAccumulator -= CONFIG.TIME_STEP;
    }
  }

  /**
   * Add a physics body to the world
   */
  public addBody(id: string, body: CANNON.Body): void {
    this.world.addBody(body);
    this.bodies.set(id, body);
  }

  /**
   * Remove a physics body from the world
   */
  public removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }

  /**
   * Get a physics body by ID
   */
  public getBody(id: string): CANNON.Body | undefined {
    return this.bodies.get(id);
  }

  /**
   * Get all bodies
   */
  public getAllBodies(): Map<string, CANNON.Body> {
    return this.bodies;
  }

  /**
   * Set gravity
   */
  public setGravity(value: number): void {
    this.world.gravity.set(0, value, 0);
    logger.info(`Gravity set to ${value}`);
  }

  /**
   * Get gravity
   */
  public getGravity(): number {
    return this.world.gravity.y;
  }

  /**
   * Create a sphere body
   */
  public createSphere(radius: number, mass: number, position: Vector3): CANNON.Body {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    return body;
  }

  /**
   * Create a box body
   */
  public createBox(halfExtents: Vector3, mass: number, position: Vector3): CANNON.Body {
    const shape = new CANNON.Box(new CANNON.Vec3(halfExtents.x, halfExtents.y, halfExtents.z));
    const body = new CANNON.Body({
      mass,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    return body;
  }

  /**
   * Create a cylinder body
   */
  public createCylinder(
    radiusTop: number,
    radiusBottom: number,
    height: number,
    mass: number,
    position: Vector3
  ): CANNON.Body {
    const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 8);
    const body = new CANNON.Body({
      mass,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    return body;
  }

  /**
   * Create a plane body (for ground)
   */
  public createPlane(position: Vector3): CANNON.Body {
    const shape = new CANNON.Plane();
    const body = new CANNON.Body({
      mass: 0, // Static
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    // Rotate to be horizontal
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    return body;
  }

  /**
   * Apply force to a body
   */
  public applyForce(id: string, force: Vector3, worldPoint?: Vector3): void {
    const body = this.bodies.get(id);
    if (body) {
      const cannonForce = new CANNON.Vec3(force.x, force.y, force.z);
      if (worldPoint) {
        const cannonPoint = new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
        body.applyForce(cannonForce, cannonPoint);
      } else {
        body.applyForce(cannonForce, body.position);
      }
    }
  }

  /**
   * Apply impulse to a body
   */
  public applyImpulse(id: string, impulse: Vector3, worldPoint?: Vector3): void {
    const body = this.bodies.get(id);
    if (body) {
      const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
      if (worldPoint) {
        const cannonPoint = new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
        body.applyImpulse(cannonImpulse, cannonPoint);
      } else {
        body.applyImpulse(cannonImpulse, body.position);
      }
    }
  }

  /**
   * Get position of a body
   */
  public getPosition(id: string): Vector3 | null {
    const body = this.bodies.get(id);
    if (body) {
      return {
        x: body.position.x,
        y: body.position.y,
        z: body.position.z,
      };
    }
    return null;
  }

  /**
   * Get velocity of a body
   */
  public getVelocity(id: string): Vector3 | null {
    const body = this.bodies.get(id);
    if (body) {
      return {
        x: body.velocity.x,
        y: body.velocity.y,
        z: body.velocity.z,
      };
    }
    return null;
  }

  /**
   * Get quaternion of a body
   */
  public getQuaternion(id: string): Quaternion | null {
    const body = this.bodies.get(id);
    if (body) {
      return {
        x: body.quaternion.x,
        y: body.quaternion.y,
        z: body.quaternion.z,
        w: body.quaternion.w,
      };
    }
    return null;
  }

  /**
   * Raycast from a point in a direction
   */
  public raycast(from: Vector3, to: Vector3): CANNON.RaycastResult | null {
    const rayFrom = new CANNON.Vec3(from.x, from.y, from.z);
    const rayTo = new CANNON.Vec3(to.x, to.y, to.z);
    const result = new CANNON.RaycastResult();

    this.world.raycastClosest(rayFrom, rayTo, {}, result);

    return result.hasHit ? result : null;
  }
}
