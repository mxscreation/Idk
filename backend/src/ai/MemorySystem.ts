import { CONFIG } from '../config/constants';
import { generateId, cosineSimilarity } from '../utils/helpers';
import type { EpisodicMemory, SemanticMemory, VocabularyEntry, SensoryInput } from '../types';

export class MemorySystem {
  private episodicMemories: Map<string, EpisodicMemory> = new Map();
  private semanticMemories: Map<string, SemanticMemory> = new Map();
  private vocabulary: Map<string, VocabularyEntry> = new Map();

  /**
   * Store a new episodic memory
   */
  public store(sensoryInput: SensoryInput, emotionalState: number[], importance: number): string {
    const memoryId = generateId('mem');

    const memory: EpisodicMemory = {
      id: memoryId,
      timestamp: Date.now(),
      sensorySnapshot: {
        visual: sensoryInput.visual.map(v => ({ ...v })),
        tactile: sensoryInput.tactile.map(t => ({ ...t })),
        auditory: sensoryInput.auditory.map(a => ({ ...a })),
        olfactory: sensoryInput.olfactory.map(o => ({ ...o })),
        gustatory: sensoryInput.gustatory.map(g => ({ ...g })),
      },
      emotionalState: [...emotionalState],
      actionsTaken: [],
      outcome: '',
      importance,
      accessCount: 0,
      lastAccessTime: Date.now(),
    };

    this.episodicMemories.set(memoryId, memory);

    // Enforce memory limit
    if (this.episodicMemories.size > CONFIG.MEMORY_MAX_COUNT) {
      this.pruneMemories();
    }

    return memoryId;
  }

  /**
   * Recall relevant memories based on current context
   */
  public recall(sensoryInput: SensoryInput, emotionalState: number[]): EpisodicMemory[] {
    const recalled: EpisodicMemory[] = [];

    // Find memories with similar sensory patterns
    for (const memory of this.episodicMemories.values()) {
      // Calculate similarity based on emotional state
      const emotionalSimilarity = cosineSimilarity(emotionalState, memory.emotionalState);

      // Simple similarity check (in full implementation would be more sophisticated)
      if (emotionalSimilarity > 0.7 || Math.random() < 0.1) {
        // Also random recall
        recalled.push(memory);

        // Update access info (strengthens memory)
        memory.accessCount++;
        memory.lastAccessTime = Date.now();
        memory.importance = Math.min(1.0, memory.importance + CONFIG.MEMORY.REHEARSAL_BOOST);
      }
    }

    // Limit recall to most recent/important
    recalled.sort((a, b) => b.importance - a.importance);
    return recalled.slice(0, 10);
  }

  /**
   * Apply memory decay (forgetting)
   */
  public applyDecay(deltaTime: number): void {
    const currentTime = Date.now();

    for (const memory of this.episodicMemories.values()) {
      const timeSinceAccess = (currentTime - memory.lastAccessTime) / 1000; // seconds

      // Decay importance over time
      const decayAmount = CONFIG.MEMORY.DECAY_RATE * timeSinceAccess * deltaTime;
      memory.importance = Math.max(0, memory.importance - decayAmount);
    }
  }

  /**
   * Prune weak memories
   */
  private pruneMemories(): void {
    const memories = Array.from(this.episodicMemories.values());

    // Sort by importance
    memories.sort((a, b) => a.importance - b.importance);

    // Remove weakest 10%
    const toRemove = Math.floor(memories.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.episodicMemories.delete(memories[i].id);
    }
  }

  /**
   * Add semantic knowledge
   */
  public addSemanticMemory(concept: string, associations: string[]): void {
    const existing = this.semanticMemories.get(concept);

    if (existing) {
      // Strengthen existing concept
      existing.strength = Math.min(1.0, existing.strength + 0.1);
      existing.associations.push(...associations);
      existing.updatedAt = Date.now();
    } else {
      const memory: SemanticMemory = {
        id: generateId('sem'),
        concept,
        associations,
        strength: 0.5,
        examples: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.semanticMemories.set(concept, memory);
    }
  }

  /**
   * Add word to vocabulary
   */
  public addVocabulary(word: string, embedding: number[], context: string[]): void {
    const existing = this.vocabulary.get(word);

    if (existing) {
      existing.strength = Math.min(1.0, existing.strength + 0.1);
      existing.usageCount++;
      existing.context.push(...context);
    } else {
      const entry: VocabularyEntry = {
        word,
        embedding,
        strength: 0.3,
        context,
        usageCount: 1,
        learnedAt: Date.now(),
      };
      this.vocabulary.set(word, entry);
    }
  }

  /**
   * Get episodic memory count
   */
  public getEpisodicCount(): number {
    return this.episodicMemories.size;
  }

  /**
   * Get semantic memory count
   */
  public getSemanticCount(): number {
    return this.semanticMemories.size;
  }

  /**
   * Get vocabulary size
   */
  public getVocabularySize(): number {
    return this.vocabulary.size;
  }

  /**
   * Serialize for saving
   */
  public serialize(): any {
    return {
      episodicMemories: Array.from(this.episodicMemories.values()),
      semanticMemories: Array.from(this.semanticMemories.values()),
      vocabulary: Array.from(this.vocabulary.values()),
    };
  }

  /**
   * Deserialize from save
   */
  public deserialize(data: any): void {
    this.episodicMemories.clear();
    this.semanticMemories.clear();
    this.vocabulary.clear();

    for (const mem of data.episodicMemories || []) {
      this.episodicMemories.set(mem.id, mem);
    }

    for (const mem of data.semanticMemories || []) {
      this.semanticMemories.set(mem.concept, mem);
    }

    for (const entry of data.vocabulary || []) {
      this.vocabulary.set(entry.word, entry);
    }
  }
}
