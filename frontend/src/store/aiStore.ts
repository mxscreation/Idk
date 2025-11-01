import { create } from 'zustand';
import type { AIInternalState } from '../../../shared/types';

interface AIStore {
  internal: AIInternalState | null;
  setInternal: (internal: AIInternalState) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  internal: null,
  setInternal: (internal) => set({ internal }),
}));
