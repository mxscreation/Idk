// Re-export shared types
export * from '../../../shared/types';

// Backend-specific types

export interface SensoryInput {
  visual: VisualInput[];
  tactile: TactileInput[];
  auditory: AuditoryInput[];
  olfactory: OlfactoryInput[];
  gustatory: GustatoryInput[];
  proprioceptive: ProprioceptiveInput;
  internal: InternalInput;
}

export interface VisualInput {
  objectId: string;
  color: [number, number, number];
  brightness: number;
  size: number;
  distance: number;
  angle: number;
  inFocus: boolean;
}

export interface TactileInput {
  objectId: string;
  texture: number;
  temperature: number;
  hardness: number;
  pressure: number;
  contactPoint: import('../../../shared/types').Vector3;
}

export interface AuditoryInput {
  objectId: string;
  frequency: number;
  volume: number;
  distance: number;
  direction: number;
}

export interface OlfactoryInput {
  objectId: string;
  smellId: string;
  intensity: number;
  valence: number;
  distance: number;
}

export interface GustatoryInput {
  objectId: string;
  tastProfile: {
    sweet: number;
    sour: number;
    bitter: number;
    salty: number;
    umami: number;
  };
  intensity: number;
}

export interface ProprioceptiveInput {
  position: import('../../../shared/types').Vector3;
  velocity: import('../../../shared/types').Vector3;
  orientation: import('../../../shared/types').Quaternion;
  angularVelocity: import('../../../shared/types').Vector3;
}

export interface InternalInput {
  energy: number;
  arousal: number;
  previousEmotion: number[];
}

export interface NeuralOutput {
  motor: MotorOutput;
  attention: AttentionOutput;
  communication: CommunicationOutput;
  emotion: number[];
  memory: MemoryOutput;
}

export interface MotorOutput {
  forceDirection: import('../../../shared/types').Vector3;
  forceMagnitude: number;
  torque: import('../../../shared/types').Vector3;
}

export interface AttentionOutput {
  targetId: string | null;
  strength: number;
  searchPattern: 'novelty' | 'familiar' | 'random';
}

export interface CommunicationOutput {
  languageSignal: number[];
  intent: 'express' | 'question' | 'describe' | null;
}

export interface MemoryOutput {
  shouldStore: boolean;
  importance: number;
  tags: string[];
  shouldRecall: boolean;
  recallQuery: number[];
}
