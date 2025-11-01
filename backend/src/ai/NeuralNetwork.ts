import * as tf from '@tensorflow/tfjs-node';
import { CONFIG } from '../config/constants';
import { logger } from '../utils/logger';
import type { SensoryInput, NeuralOutput, Vector3 } from '../types';

export class NeuralNetwork {
  private model: tf.LayersModel | null = null;
  private learningRate: number = CONFIG.NEURAL_LEARNING_RATE;
  private optimizer: any = null; // tf.train.Optimizer type
  private previousPrediction: any = null; // tf.Tensor type
  private isInitialized: boolean = false;

  /**
   * Initialize neural network with random weights
   */
  public initialize(): void {
    logger.info('Initializing neural network...');

    // Create a recurrent neural network
    const input = tf.input({ shape: [CONFIG.NEURAL.INPUT_SIZE] });

    // Hidden layers with LSTM for temporal processing
    let x: any = input;

    // First hidden layer
    x = tf.layers
      .dense({
        units: CONFIG.NEURAL.HIDDEN_LAYERS[0],
        activation: 'relu',
        kernelInitializer: 'heNormal',
      })
      .apply(x);

    // Second hidden layer
    x = tf.layers
      .dense({
        units: CONFIG.NEURAL.HIDDEN_LAYERS[1],
        activation: 'relu',
      })
      .apply(x);

    // Third hidden layer (for emotion extraction)
    x = tf.layers
      .dense({
        units: CONFIG.NEURAL.HIDDEN_LAYERS[2],
        activation: 'tanh',
      })
      .apply(x);

    // Fourth hidden layer
    x = tf.layers
      .dense({
        units: CONFIG.NEURAL.HIDDEN_LAYERS[3],
        activation: 'tanh',
      })
      .apply(x);

    // Output layer
    const output = tf.layers
      .dense({
        units: CONFIG.NEURAL.OUTPUT_SIZE,
        activation: 'tanh',
      })
      .apply(x);

    this.model = tf.model({ inputs: input, outputs: output as tf.SymbolicTensor });

    // Create optimizer
    this.optimizer = tf.train.adam(this.learningRate);

    this.isInitialized = true;
    logger.info('Neural network initialized with random weights');
  }

  /**
   * Forward pass through network
   */
  public forward(sensoryInput: SensoryInput, emotionState: number[], memories: any[]): NeuralOutput {
    if (!this.model) {
      throw new Error('Neural network not initialized');
    }

    // Convert sensory input to tensor
    const inputTensor = this.sensoryInputToTensor(sensoryInput, emotionState, memories);

    // Forward pass
    const outputTensor = this.model.predict(inputTensor) as any;

    // Store prediction for learning
    if (this.previousPrediction) {
      this.previousPrediction.dispose();
    }
    this.previousPrediction = outputTensor.clone();

    // Convert output to NeuralOutput
    const output = this.tensorToNeuralOutput(outputTensor);

    // Cleanup
    inputTensor.dispose();

    return output;
  }

  /**
   * Calculate prediction error (for curiosity and learning)
   */
  public calculatePredictionError(actualInput: SensoryInput): number {
    if (!this.previousPrediction) return 0;

    // Simplified prediction error calculation
    // In a full implementation, this would compare predicted next state with actual
    const randomError = Math.random() * 0.5; // Placeholder for now
    return randomError;
  }

  /**
   * Learn from experience
   */
  public learn(sensoryInput: SensoryInput, predictionError: number): void {
    if (!this.model || !this.optimizer) return;

    // Simplified learning - in full implementation would use backpropagation
    // through time with prediction errors

    // Adjust learning rate based on prediction error (higher error = faster learning)
    const adjustedLearningRate = this.learningRate * (1 + predictionError);

    // Placeholder: In full implementation, would perform gradient descent here
    // For now, we'll skip the actual backprop as it requires significant setup
  }

  /**
   * Convert sensory input to tensor
   */
  private sensoryInputToTensor(sensoryInput: SensoryInput, emotionState: number[], memories: any[]): any {
    const inputArray: number[] = [];

    // Visual inputs (flatten)
    for (const v of sensoryInput.visual.slice(0, 20)) {
      // Limit to 20 objects
      inputArray.push(...v.color.map(c => c / 255)); // Normalize
      inputArray.push(v.brightness, v.size, v.distance / 50, v.angle / Math.PI);
      inputArray.push(v.inFocus ? 1 : 0);
    }

    // Pad if less than 20 objects
    while (inputArray.length < 20 * 9) {
      inputArray.push(0);
    }

    // Tactile inputs
    for (const t of sensoryInput.tactile.slice(0, 5)) {
      inputArray.push(t.texture, t.temperature, t.hardness, t.pressure);
    }
    while (inputArray.length < 20 * 9 + 5 * 4) {
      inputArray.push(0);
    }

    // Proprioceptive
    inputArray.push(
      sensoryInput.proprioceptive.position.x / 50,
      sensoryInput.proprioceptive.position.y / 50,
      sensoryInput.proprioceptive.position.z / 50,
      sensoryInput.proprioceptive.velocity.x / 10,
      sensoryInput.proprioceptive.velocity.y / 10,
      sensoryInput.proprioceptive.velocity.z / 10
    );

    // Internal state
    inputArray.push(
      sensoryInput.internal.energy,
      sensoryInput.internal.arousal,
      ...sensoryInput.internal.previousEmotion.slice(0, 10)
    );

    // Pad or truncate to INPUT_SIZE
    while (inputArray.length < CONFIG.NEURAL.INPUT_SIZE) {
      inputArray.push(0);
    }
    const finalInput = inputArray.slice(0, CONFIG.NEURAL.INPUT_SIZE);

    return tf.tensor2d([finalInput]);
  }

  /**
   * Convert tensor output to NeuralOutput structure
   */
  private tensorToNeuralOutput(outputTensor: any): NeuralOutput {
    const outputArray: number[] = Array.from(outputTensor.dataSync() as any);

    // Parse output tensor into structured format
    let idx = 0;

    // Motor output (10 values)
    const motorDirection = {
      x: outputArray[idx++],
      y: outputArray[idx++],
      z: outputArray[idx++],
    };
    const motorMagnitude = Math.abs(outputArray[idx++]);
    const torque = {
      x: outputArray[idx++],
      y: outputArray[idx++],
      z: outputArray[idx++],
    };

    // Attention (5 values)
    const attentionStrength = (outputArray[idx++] + 1) / 2; // Map from [-1, 1] to [0, 1]
    const attentionType = outputArray[idx++];

    // Emotion (64 values)
    const emotion = Array.from(outputArray.slice(idx, idx + CONFIG.EMOTION_DIMENSIONS));
    idx += CONFIG.EMOTION_DIMENSIONS;

    // Memory signals (5 values)
    const shouldStore = outputArray[idx++] > 0;
    const importance = (outputArray[idx++] + 1) / 2;
    const shouldRecall = outputArray[idx++] > 0;

    // Language signals (remaining values)
    const languageSignal = Array.from(outputArray.slice(idx, idx + 20));

    return {
      motor: {
        forceDirection: motorDirection,
        forceMagnitude: motorMagnitude,
        torque,
      },
      attention: {
        targetId: null, // Will be determined by curiosity engine
        strength: attentionStrength,
        searchPattern: attentionType > 0 ? 'novelty' : 'familiar',
      },
      communication: {
        languageSignal,
        intent: null,
      },
      emotion,
      memory: {
        shouldStore,
        importance,
        tags: [],
        shouldRecall,
        recallQuery: [],
      },
    };
  }

  /**
   * Get current learning rate
   */
  public getLearningRate(): number {
    return this.learningRate;
  }

  /**
   * Serialize network for saving
   */
  public serialize(): any {
    if (!this.model) return null;

    // In a full implementation, would serialize weights
    // For now, return placeholder
    return {
      architecture: {
        inputSize: CONFIG.NEURAL.INPUT_SIZE,
        hiddenLayers: CONFIG.NEURAL.HIDDEN_LAYERS,
        outputSize: CONFIG.NEURAL.OUTPUT_SIZE,
      },
      learningRate: this.learningRate,
      // weights: would serialize actual weights here
    };
  }

  /**
   * Deserialize network from save
   */
  public deserialize(data: any): void {
    // In full implementation, would load weights
    this.learningRate = data.learningRate;
    this.initialize(); // For now, just reinitialize
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
    if (this.previousPrediction) {
      this.previousPrediction.dispose();
    }
  }
}
