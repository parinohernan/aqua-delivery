import { create } from 'zustand';

export type RutasOrdenPendingAction =
  | { kind: 'nav'; to: string }
  | { kind: 'zona'; zona: string };

interface RutasOrdenState {
  ordenDirty: boolean;
  saveOrderFn: (() => Promise<void>) | null;
  setOrdenDirty: (v: boolean) => void;
  registerSaveOrder: (fn: (() => Promise<void>) | null) => void;

  pendingAction: RutasOrdenPendingAction | null;
  openPending: (action: RutasOrdenPendingAction) => void;
  clearPending: () => void;

  zonaCommitFn: ((zona: string) => void) | null;
  registerZonaCommit: (fn: ((zona: string) => void) | null) => void;
}

export const useRutasOrdenStore = create<RutasOrdenState>((set) => ({
  ordenDirty: false,
  saveOrderFn: null,
  setOrdenDirty: (v) => set({ ordenDirty: v }),
  registerSaveOrder: (fn) => set({ saveOrderFn: fn }),

  pendingAction: null,
  openPending: (action) => set({ pendingAction: action }),
  clearPending: () => set({ pendingAction: null }),

  zonaCommitFn: null,
  registerZonaCommit: (fn) => set({ zonaCommitFn: fn }),
}));
