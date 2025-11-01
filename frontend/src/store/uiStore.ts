import { create } from 'zustand';

interface UIStore {
  isPaused: boolean;
  simulationSpeed: number;
  showDebugPanel: boolean;
  showChatPanel: boolean;
  showWorldBuilder: boolean;

  togglePause: () => void;
  setSimulationSpeed: (speed: number) => void;
  toggleDebugPanel: () => void;
  toggleChatPanel: () => void;
  toggleWorldBuilder: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isPaused: false,
  simulationSpeed: 1.0,
  showDebugPanel: true,
  showChatPanel: true,
  showWorldBuilder: true,

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSimulationSpeed: (simulationSpeed) => set({ simulationSpeed }),
  toggleDebugPanel: () => set((state) => ({ showDebugPanel: !state.showDebugPanel })),
  toggleChatPanel: () => set((state) => ({ showChatPanel: !state.showChatPanel })),
  toggleWorldBuilder: () => set((state) => ({ showWorldBuilder: !state.showWorldBuilder })),
}));
