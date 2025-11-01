// Shared TypeScript types between frontend and backend

// ===== Vector Types =====
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

// ===== Sensory Property Types =====
export interface VisualProperties {
  color: [number, number, number]; // RGB 0-255
  brightness: number; // 0-1
  transparency: number; // 0-1
  pattern?: string;
  size: number;
}

export interface TactileProperties {
  texture: number; // 0 (smooth) to 1 (rough)
  hardness: number; // 0 (soft) to 1 (hard)
  temperature: number; // 0 (cold) to 1 (hot), 0.5 is neutral
  weight: number;
}

export interface AuditoryProperties {
  collisionSound?: string;
  ambientSound?: string;
  volume: number; // 0-1
  pitch: number;
}

export interface OlfactoryProperties {
  smellId?: string;
  intensity: number; // 0-1
  valence: number; // -1 (unpleasant) to 1 (pleasant)
}

export interface GustatoryProperties {
  sweet: number; // 0-1
  sour: number; // 0-1
  bitter: number; // 0-1
  salty: number; // 0-1
  umami: number; // 0-1
  intensity: number; // 0-1
  safeToTaste: boolean;
}

export interface CustomProperties {
  [key: string]: any;
}

export interface SensoryProperties {
  visual: VisualProperties;
  tactile: TactileProperties;
  auditory: AuditoryProperties;
  olfactory: OlfactoryProperties;
  gustatory: GustatoryProperties;
  custom?: CustomProperties;
}

// ===== World Object Types =====
export type ObjectShape = 'sphere' | 'box' | 'cylinder' | 'plane' | 'custom';

export interface PhysicalProperties {
  shape: ObjectShape;
  dimensions: Vector3; // size/radius for sphere, width/height/depth for box, etc.
  mass: number;
  friction: number;
  restitution: number; // bounciness
  isStatic: boolean; // immovable objects
}

export interface WorldObject {
  id: string;
  type: ObjectShape;
  position: Vector3;
  rotation: Quaternion;
  velocity?: Vector3;
  angularVelocity?: Vector3;
  physical: PhysicalProperties;
  sensory: SensoryProperties;
  createdAt: number;
}

// ===== AI State Types =====
export interface AIPosition {
  position: Vector3;
  velocity: Vector3;
  orientation: Quaternion;
}

export interface EmotionState {
  vector: number[]; // 64-128 dimensional emotion vector
  valence: number; // derived: positive/negative feeling
  arousal: number; // derived: energy level
  timestamp: number;
}

export interface AttentionState {
  targetId: string | null;
  strength: number; // 0-1
  focusPosition: Vector3 | null;
}

export interface MemoryInfo {
  episodicCount: number;
  semanticCount: number;
  vocabularySize: number;
  totalExperiences: number;
}

export interface AIInternalState {
  emotion: EmotionState;
  attention: AttentionState;
  curiosity: number; // 0-1
  currentThought: string;
  memory: MemoryInfo;
  learningRate: number;
}

export interface AIState extends AIPosition {
  internal: AIInternalState;
}

// ===== Memory Types =====
export interface EpisodicMemory {
  id: string;
  timestamp: number;
  sensorySnapshot: {
    visual: any[];
    tactile: any[];
    auditory: any[];
    olfactory: any[];
    gustatory: any[];
  };
  emotionalState: number[];
  actionsTaken: string[];
  outcome: string;
  importance: number; // 0-1
  accessCount: number;
  lastAccessTime: number;
}

export interface SemanticMemory {
  id: string;
  concept: string;
  associations: string[];
  strength: number;
  examples: string[]; // references to episodic memories
  createdAt: number;
  updatedAt: number;
}

export interface VocabularyEntry {
  word: string;
  embedding: number[];
  strength: number;
  context: string[];
  usageCount: number;
  learnedAt: number;
}

// ===== World State Types =====
export interface WorldState {
  objects: WorldObject[];
  gravity: number;
  time: number;
  environmentProperties: {
    ambientLight: number;
    temperature: number;
    [key: string]: any;
  };
}

// ===== Communication Protocol Types =====

// Frontend to Backend Events
export interface AddObjectEvent {
  type: ObjectShape;
  position: Vector3;
  properties: Partial<SensoryProperties>;
  physical?: Partial<PhysicalProperties>;
}

export interface RemoveObjectEvent {
  objectId: string;
}

export interface ModifyObjectEvent {
  objectId: string;
  properties: Partial<SensoryProperties>;
}

export interface ChatMessageEvent {
  text: string;
  timestamp: number;
}

export interface SetGravityEvent {
  value: number;
}

export interface SaveEvent {
  slotName: string;
}

export interface LoadEvent {
  slotName: string;
}

// Backend to Frontend Events
export interface WorldUpdateEvent {
  aiState: AIState;
  objects: WorldObject[];
  deltaTime: number;
}

export interface AIStateUpdateEvent {
  internal: AIInternalState;
}

export interface ChatAIMessageEvent {
  text: string;
  emotionalTone: number[];
  timestamp: number;
}

export interface SystemEvent {
  type: 'saveComplete' | 'loadComplete' | 'error';
  success: boolean;
  message?: string;
  data?: any;
}

// ===== Save File Types =====
export interface SaveFile {
  version: string;
  timestamp: string;
  aiState: {
    neuralNetwork: {
      architecture: any;
      weights: any;
    };
    emotionState: EmotionState;
    attentionState: AttentionState;
    internalState: any;
  };
  memorySystem: {
    episodicMemories: EpisodicMemory[];
    semanticMemories: SemanticMemory[];
    vocabulary: { [word: string]: VocabularyEntry };
  };
  worldState: WorldState;
  statistics: {
    totalExperiences: number;
    vocabularySize: number;
    creativeEvents: number;
    [key: string]: any;
  };
}

// ===== Configuration Types =====
export interface AIConfig {
  neuralLearningRate: number;
  memoryMaxCount: number;
  updateFrequency: number;
  emotionDimensions: number;
}

export interface PhysicsConfig {
  gravity: number;
  timeStep: number;
  solverIterations: number;
  defaultFriction: number;
  defaultRestitution: number;
}

export interface SystemConfig {
  ai: AIConfig;
  physics: PhysicsConfig;
  autoSaveInterval: number;
  debug: boolean;
}
