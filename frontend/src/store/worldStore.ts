import { create } from 'zustand';
import type { WorldObject } from '../../../shared/types';

interface WorldStore {
  objects: WorldObject[];
  aiPosition: { x: number; y: number; z: number };
  aiVelocity: { x: number; y: number; z: number };
  aiOrientation: { x: number; y: number; z: number; w: number };
  gravity: number;

  setObjects: (objects: WorldObject[]) => void;
  setAIPosition: (position: { x: number; y: number; z: number }) => void;
  setAIVelocity: (velocity: { x: number; y: number; z: number }) => void;
  setAIOrientation: (orientation: { x: number; y: number; z: number; w: number }) => void;
  setGravity: (gravity: number) => void;
}

export const useWorldStore = create<WorldStore>((set) => ({
  objects: [],
  aiPosition: { x: 0, y: 0.5, z: 0 },
  aiVelocity: { x: 0, y: 0, z: 0 },
  aiOrientation: { x: 0, y: 0, z: 0, w: 1 },
  gravity: -9.8,

  setObjects: (objects) => set({ objects }),
  setAIPosition: (aiPosition) => set({ aiPosition }),
  setAIVelocity: (aiVelocity) => set({ aiVelocity }),
  setAIOrientation: (aiOrientation) => set({ aiOrientation }),
  setGravity: (gravity) => set({ gravity }),
}));
