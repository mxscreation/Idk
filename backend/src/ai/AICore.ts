import { NeuralNetwork } from './NeuralNetwork';
import { SensoryProcessor } from './SensoryProcessor';
import { MemorySystem } from './MemorySystem';
import { EmotionSystem } from './EmotionSystem';
import { CuriosityEngine } from './CuriosityEngine';
import { LanguageProcessor } from './LanguageProcessor';
import { CreativityModule } from './CreativityModule';
import { SaveManager } from '../persistence/SaveManager';
import { WorldState } from '../world/WorldState';
import { PhysicsWorld } from '../world/PhysicsWorld';
import { logger } from '../utils/logger';
import { generateId } from '../utils/helpers';
import type {
  AIState,
  AIInternalState,
  SensoryInput,
  NeuralOutput,
  Vector3,
} from '../types';

export class AICore {
  // Core systems
  private neuralNetwork: NeuralNetwork;
  private sensoryProcessor: SensoryProcessor;
  private memorySystem: MemorySystem;
  private emotionSystem: EmotionSystem;
  private curiosityEngine: CuriosityEngine;
  private languageProcessor: LanguageProcessor;
  private creativityModule: CreativityModule;
  private saveManager: SaveManager;

  // World references
  private worldState: WorldState;
  private physicsWorld: PhysicsWorld;

  // AI state
  private aiId: string = 'ai_entity';
  private position: Vector3 = { x: 0, y: 0.5, z: 0 };
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };
  private orientation: any = { x: 0, y: 0, z: 0, w: 1 };

  // Internal state
  private energy: number = 1.0;
  private arousal: number = 0.5;
  private currentThought: string = '';

  // Statistics
  private totalExperiences: number = 0;
  private isInitialized: boolean = false;

  constructor(worldState: WorldState, physicsWorld: PhysicsWorld) {
    this.worldState = worldState;
    this.physicsWorld = physicsWorld;

    // Initialize all subsystems
    this.neuralNetwork = new NeuralNetwork();
    this.sensoryProcessor = new SensoryProcessor();
    this.memorySystem = new MemorySystem();
    this.emotionSystem = new EmotionSystem();
    this.curiosityEngine = new CuriosityEngine(this.memorySystem);
    this.languageProcessor = new LanguageProcessor(this.memorySystem);
    this.creativityModule = new CreativityModule();
    this.saveManager = new SaveManager();

    logger.info('AI Core initialized');
  }

  /**
   * Initialize AI as "newborn"
   */
  public initialize(): void {
    if (this.isInitialized) {
      logger.warn('AI already initialized');
      return;
    }

    logger.info('Initializing AI as newborn...');

    // Create AI's physical body
    const aiBody = this.physicsWorld.createSphere(0.5, 1.0, this.position);
    this.physicsWorld.addBody(this.aiId, aiBody);

    // Initialize neural network with random weights
    this.neuralNetwork.initialize();

    // AI starts with zero knowledge
    this.currentThought = 'Everything is new...';

    this.isInitialized = true;
    logger.info('AI birth complete - beginning exploration');
  }

  /**
   * Main update cycle
   */
  public update(deltaTime: number): void {
    if (!this.isInitialized) return;

    try {
      // 1. Perception: Gather sensory input from world
      const sensoryInput = this.perceive();

      // 2. Recall: Retrieve relevant memories
      const memories = this.memorySystem.recall(sensoryInput, this.emotionSystem.getState());

      // 3. Process: Neural network processes input
      const neuralOutput = this.think(sensoryInput, memories);

      // 4. Update internal states
      this.updateInternalStates(neuralOutput, sensoryInput);

      // 5. Act: Execute motor commands
      this.act(neuralOutput);

      // 6. Learn: Update neural network based on prediction errors
      this.learn(sensoryInput, neuralOutput);

      // 7. Form memories
      this.remember(sensoryInput, neuralOutput);

      // 8. Language processing (if any pending messages)
      this.languageProcessor.process(deltaTime);

      // 9. Check for creative behaviors
      this.creativityModule.detect(neuralOutput, this.memorySystem);

      this.totalExperiences++;
    } catch (error) {
      logger.error('Error in AI update cycle:', error);
    }
  }

  /**
   * Perceive the world through senses
   */
  private perceive(): SensoryInput {
    // Update AI position from physics
    const physicsPos = this.physicsWorld.getPosition(this.aiId);
    if (physicsPos) {
      this.position = physicsPos;
    }

    const physicsVel = this.physicsWorld.getVelocity(this.aiId);
    if (physicsVel) {
      this.velocity = physicsVel;
    }

    const physicsRot = this.physicsWorld.getQuaternion(this.aiId);
    if (physicsRot) {
      this.orientation = physicsRot;
    }

    // Process sensory input
    const sensoryInput = this.sensoryProcessor.process(
      this.position,
      this.orientation,
      this.worldState,
      this.curiosityEngine.getAttentionTarget()
    );

    return sensoryInput;
  }

  /**
   * Think - process through neural network
   */
  private think(sensoryInput: SensoryInput, memories: any[]): NeuralOutput {
    const neuralOutput = this.neuralNetwork.forward(
      sensoryInput,
      this.emotionSystem.getState(),
      memories
    );

    return neuralOutput;
  }

  /**
   * Update internal states (emotion, curiosity, etc.)
   */
  private updateInternalStates(neuralOutput: NeuralOutput, sensoryInput: SensoryInput): void {
    // Update emotion system
    this.emotionSystem.update(neuralOutput.emotion);

    // Update curiosity based on novelty and prediction error
    this.curiosityEngine.update(sensoryInput, this.memorySystem);

    // Update attention based on neural output
    if (neuralOutput.attention.targetId) {
      this.curiosityEngine.setAttentionTarget(neuralOutput.attention.targetId);
    }

    // Generate internal thought (if language exists)
    if (this.languageProcessor.hasLanguage()) {
      this.currentThought = this.languageProcessor.generateThought(
        sensoryInput,
        this.emotionSystem.getState()
      );
    }
  }

  /**
   * Act - execute motor commands
   */
  private act(neuralOutput: NeuralOutput): void {
    const motor = neuralOutput.motor;

    // Apply force to AI body
    if (motor.forceMagnitude > 0.01) {
      this.physicsWorld.applyForce(this.aiId, {
        x: motor.forceDirection.x * motor.forceMagnitude,
        y: motor.forceDirection.y * motor.forceMagnitude,
        z: motor.forceDirection.z * motor.forceMagnitude,
      });
    }
  }

  /**
   * Learn - update neural network
   */
  private learn(sensoryInput: SensoryInput, neuralOutput: NeuralOutput): void {
    // Calculate prediction error (surprise)
    const predictionError = this.neuralNetwork.calculatePredictionError(sensoryInput);

    // Update network based on surprise
    if (predictionError > 0.01) {
      this.neuralNetwork.learn(sensoryInput, predictionError);
    }
  }

  /**
   * Remember - form new memories
   */
  private remember(sensoryInput: SensoryInput, neuralOutput: NeuralOutput): void {
    if (neuralOutput.memory.shouldStore) {
      this.memorySystem.store(sensoryInput, this.emotionSystem.getState(), neuralOutput.memory.importance);
    }
  }

  /**
   * Process user message
   */
  public processUserMessage(message: string): void {
    this.languageProcessor.processUserInput(message);
  }

  /**
   * Get current AI state
   */
  public getState(): AIState {
    return {
      position: this.position,
      velocity: this.velocity,
      orientation: this.orientation,
      internal: this.getInternalState(),
    };
  }

  /**
   * Get internal state for display
   */
  public getInternalState(): AIInternalState {
    return {
      emotion: this.emotionSystem.getDisplayState(),
      attention: this.curiosityEngine.getAttentionState(),
      curiosity: this.curiosityEngine.getCuriosityLevel(),
      currentThought: this.currentThought,
      memory: {
        episodicCount: this.memorySystem.getEpisodicCount(),
        semanticCount: this.memorySystem.getSemanticCount(),
        vocabularySize: this.languageProcessor.getVocabularySize(),
        totalExperiences: this.totalExperiences,
      },
      learningRate: this.neuralNetwork.getLearningRate(),
    };
  }

  /**
   * Save AI state
   */
  public async save(slotName: string): Promise<void> {
    logger.info(`Saving AI state to ${slotName}...`);

    const saveData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      aiState: {
        position: this.position,
        velocity: this.velocity,
        orientation: this.orientation,
        energy: this.energy,
        arousal: this.arousal,
        neuralNetwork: this.neuralNetwork.serialize(),
        emotionState: this.emotionSystem.serialize(),
      },
      memorySystem: this.memorySystem.serialize(),
      languageSystem: this.languageProcessor.serialize(),
      statistics: {
        totalExperiences: this.totalExperiences,
        vocabularySize: this.languageProcessor.getVocabularySize(),
        creativeEvents: this.creativityModule.getCreativeEventCount(),
      },
    };

    await this.saveManager.save(slotName, saveData);
    logger.info('Save complete');
  }

  /**
   * Load AI state
   */
  public async load(slotName: string): Promise<void> {
    logger.info(`Loading AI state from ${slotName}...`);

    const saveData = await this.saveManager.load(slotName);

    if (saveData) {
      this.position = saveData.aiState.position;
      this.velocity = saveData.aiState.velocity;
      this.orientation = saveData.aiState.orientation;
      this.energy = saveData.aiState.energy;
      this.arousal = saveData.aiState.arousal;

      this.neuralNetwork.deserialize(saveData.aiState.neuralNetwork);
      this.emotionSystem.deserialize(saveData.aiState.emotionState);
      this.memorySystem.deserialize(saveData.memorySystem);
      this.languageProcessor.deserialize(saveData.languageSystem);

      this.totalExperiences = saveData.statistics.totalExperiences;

      // Update physics body position
      const aiBody = this.physicsWorld.getBody(this.aiId);
      if (aiBody) {
        aiBody.position.set(this.position.x, this.position.y, this.position.z);
        aiBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
      }

      this.isInitialized = true;
      logger.info('Load complete');
    }
  }
}
