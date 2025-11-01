import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // File paths
  SAVE_DIR: process.env.SAVE_DIR || './data/saves',
  MEMORY_DIR: process.env.MEMORY_DIR || './data/memories',
  BACKUP_DIR: process.env.BACKUP_DIR || './data/backups',

  // AI configuration
  NEURAL_LEARNING_RATE: parseFloat(process.env.NEURAL_LEARNING_RATE || '0.001'),
  MEMORY_MAX_COUNT: parseInt(process.env.MEMORY_MAX_COUNT || '100000', 10),
  AUTO_SAVE_INTERVAL: parseInt(process.env.AUTO_SAVE_INTERVAL || '300000', 10),
  UPDATE_FREQUENCY: parseInt(process.env.UPDATE_FREQUENCY || '60', 10),

  // Emotion system
  EMOTION_DIMENSIONS: 64,

  // Physics configuration
  GRAVITY: parseFloat(process.env.GRAVITY || '-9.8'),
  TIME_STEP: parseFloat(process.env.TIME_STEP || '0.016667'),
  SOLVER_ITERATIONS: 10,
  DEFAULT_FRICTION: 0.3,
  DEFAULT_RESTITUTION: 0.3,

  // Neural network architecture
  NEURAL: {
    INPUT_SIZE: 300,
    HIDDEN_LAYERS: [512, 256, 128, 64],
    OUTPUT_SIZE: 150,
    SEQUENCE_LENGTH: 20,
  },

  // Sensory processing
  SENSORY: {
    VISUAL_FOV: 180, // degrees
    HEARING_RANGE: 50, // units
    SMELL_RANGE: 10, // units
    ATTENTION_SPOTLIGHT_BOOST: 2.0,
  },

  // Memory system
  MEMORY: {
    DECAY_RATE: 0.0001,
    MIN_IMPORTANCE: 0.01,
    CONSOLIDATION_THRESHOLD: 0.8,
    REHEARSAL_BOOST: 0.1,
  },

  // Curiosity parameters
  CURIOSITY: {
    NOVELTY_WEIGHT: 1.0,
    PREDICTION_ERROR_WEIGHT: 1.0,
    COMPETENCE_WEIGHT: 0.5,
    EXPLORATION_RATE: 0.3,
  },

  // Debug
  DEBUG: process.env.DEBUG === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
